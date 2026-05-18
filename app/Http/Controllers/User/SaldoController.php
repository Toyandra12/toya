<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\SaldoTopup;
use App\Models\SaldoHistory;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaldoController extends Controller
{
    public function __construct(private MidtransService $midtrans) {}

    public function show()
    {
        $user     = Auth::user();
        $topups   = SaldoTopup::where('user_id', $user->id)->latest()->paginate(10);
        $histories = SaldoHistory::where('user_id', $user->id)->latest()->paginate(10);

        return Inertia::render('User/Saldo', [
            'user'      => $user,
            'topups'    => $topups,
            'histories' => $histories,
            'clientKey' => config('toya.midtrans.client_key'),
        ]);
    }

    public function topup(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10000|max:10000000',
        ]);

        $user   = Auth::user();
        $invoice = SaldoTopup::generateInvoice();

        $saldoTopup = SaldoTopup::create([
            'invoice_number' => $invoice,
            'user_id'        => $user->id,
            'amount'         => $request->amount,
            'payment_method' => 'midtrans',
            'payment_status' => 'pending',
            'status'         => 'pending',
        ]);

        $snapResult = $this->midtrans->createSaldoTopupSnap(
            $invoice,
            $request->amount,
            ['name' => $user->name, 'email' => $user->email, 'phone' => $user->phone ?? '']
        );

        if (!$snapResult['success']) {
            $saldoTopup->delete();
            return response()->json(['success' => false, 'message' => 'Gagal membuat pembayaran.'], 422);
        }

        $saldoTopup->update([
            'midtrans_order_id'  => $invoice,
            'midtrans_snap_token' => $snapResult['token'],
            'midtrans_snap_url'   => $snapResult['redirect_url'],
        ]);

        return response()->json([
            'success'    => true,
            'snap_token' => $snapResult['token'],
            'invoice'    => $invoice,
        ]);
    }

    /**
     * Called internally when payment is confirmed
     */
    public function approveSaldoTopup(SaldoTopup $saldoTopup): void
    {
        if ($saldoTopup->status !== 'pending') return;

        DB::transaction(function () use ($saldoTopup) {
            $user   = $saldoTopup->user;
            $before = $user->saldo;

            $user->increment('saldo', $saldoTopup->amount);
            $user->refresh();

            SaldoHistory::create([
                'user_id'        => $user->id,
                'type'           => 'credit',
                'amount'         => $saldoTopup->amount,
                'balance_before' => $before,
                'balance_after'  => $user->saldo,
                'description'    => 'Top Up Saldo via Midtrans - ' . $saldoTopup->invoice_number,
                'reference_type' => 'saldo_topup',
                'reference_id'   => $saldoTopup->id,
            ]);

            $saldoTopup->update([
                'status'      => 'approved',
                'approved_at' => now(),
                'paid_at'     => now(),
            ]);
        });
    }
}
