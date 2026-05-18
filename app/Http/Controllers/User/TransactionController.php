<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\MidtransService;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function __construct(
        private MidtransService    $midtrans,
        private TransactionService $transactionService,
    ) {}

    public function index(Request $request)
    {
        $transactions = Transaction::where('user_id', Auth::id())
            ->with(['product.brand', 'product.category'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('invoice_number', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('User/TransactionHistory', [
            'transactions' => $transactions,
            'filters'      => $request->only('status', 'search'),
        ]);
    }

    public function show(string $invoiceNumber)
    {
        $transaction = Transaction::where('invoice_number', $invoiceNumber)
            ->where('user_id', Auth::id())
            ->with(['product.brand', 'product.category'])
            ->firstOrFail();

        return Inertia::render('User/TransactionDetail', [
            'transaction' => $transaction,
            'clientKey'   => config('toya.midtrans.client_key'),
        ]);
    }

    /**
     * Midtrans payment notification callback
     */
    public function midtransNotification(Request $request)
    {
        $result = $this->midtrans->handleNotification();

        if (!$result['success']) {
            return response()->json(['message' => 'Error'], 500);
        }

        // Find transaction (could be regular transaction or saldo topup)
        $orderId = $result['order_id'];

        $transaction = Transaction::where('invoice_number', $orderId)->first();
        if ($transaction) {
            $transaction->update([
                'midtrans_transaction_id' => $result['transaction_id'],
                'payment_channel'         => $result['payment_type'],
                'payment_status'          => $result['payment_status'],
            ]);

            if ($result['payment_status'] === 'paid' && $transaction->status === 'pending') {
                $transaction->update(['status' => 'paid', 'paid_at' => now()]);
                // Kick off fulfillment
                dispatch(fn() => $this->transactionService->processFulfillment($transaction));
            } elseif ($result['payment_status'] === 'failed') {
                $transaction->update(['status' => 'failed']);
            }

            return response()->json(['message' => 'OK']);
        }

        // Check saldo topup
        $saldoTopup = \App\Models\SaldoTopup::where('midtrans_order_id', $orderId)->first();
        if ($saldoTopup) {
            $saldoTopup->update([
                'midtrans_transaction_id' => $result['transaction_id'],
                'payment_channel'         => $result['payment_type'],
                'payment_status'          => $result['payment_status'],
            ]);

            if ($result['payment_status'] === 'paid' && $saldoTopup->status === 'pending') {
                app(\App\Http\Controllers\User\SaldoController::class)
                    ->approveSaldoTopup($saldoTopup);
            }
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * Check Midtrans payment status (polling from frontend)
     */
    public function checkPaymentStatus(string $invoiceNumber)
    {
        $transaction = Transaction::where('invoice_number', $invoiceNumber)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return response()->json([
            'status'         => $transaction->status,
            'payment_status' => $transaction->payment_status,
            'sn'             => $transaction->sn,
        ]);
    }
}
