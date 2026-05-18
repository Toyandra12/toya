<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaldoTopup;
use App\Models\SaldoHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaldoTopupController extends Controller
{
    public function index(Request $request)
    {
        $topups = SaldoTopup::with('user')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q
                ->whereHas('user', fn($uq) => $uq->where('email', 'like', "%{$request->search}%"))
                ->orWhere('invoice_number', 'like', "%{$request->search}%")
            )
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/SaldoTopups/Index', [
            'topups'  => $topups,
            'filters' => $request->only('status', 'search'),
        ]);
    }

    public function approve(SaldoTopup $saldoTopup)
    {
        abort_unless($saldoTopup->status === 'pending', 422, 'Sudah diproses.');

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
                'description'    => 'Top Up Saldo Disetujui - ' . $saldoTopup->invoice_number,
                'reference_type' => 'saldo_topup',
                'reference_id'   => $saldoTopup->id,
            ]);

            $saldoTopup->update([
                'status'      => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);
        });

        return back()->with('success', 'Top Up Saldo berhasil disetujui.');
    }

    public function reject(Request $request, SaldoTopup $saldoTopup)
    {
        $request->validate(['note' => 'nullable|string|max:255']);
        abort_unless($saldoTopup->status === 'pending', 422, 'Sudah diproses.');

        $saldoTopup->update([
            'status'      => 'rejected',
            'note'        => $request->note,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Top Up Saldo ditolak.');
    }
}
