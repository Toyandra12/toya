<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\TransactionService;
use App\Services\DigiflazzService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function __construct(
        private TransactionService $transactionService,
        private DigiflazzService   $digiflazz,
    ) {}

    public function index(Request $request)
    {
        $transactions = Transaction::with(['user', 'product.brand', 'product.category'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->supplier, fn($q) => $q->where('supplier', $request->supplier))
            ->when($request->search, fn($q) => $q
                ->where('invoice_number', 'like', "%{$request->search}%")
                ->orWhereHas('user', fn($uq) => $uq->where('email', 'like', "%{$request->search}%"))
            )
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'filters'      => $request->only('status', 'supplier', 'search', 'date_from', 'date_to'),
            'statuses'     => config('toya.transaction_statuses'),
        ]);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load(['user', 'product.brand', 'product.category', 'processedBy']);

        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => $transaction,
            'statuses'    => config('toya.transaction_statuses'),
        ]);
    }

    /**
     * Update transaction status manually
     */
    public function updateStatus(Request $request, Transaction $transaction)
    {
        $request->validate([
            'status'     => 'required|in:pending,paid,processing,success,failed,refunded,cancelled',
            'admin_note' => 'nullable|string|max:500',
            'sn'         => 'nullable|string',
        ]);

        $transaction->update([
            'status'       => $request->status,
            'admin_note'   => $request->admin_note,
            'sn'           => $request->sn ?? $transaction->sn,
            'processed_by' => Auth::id(),
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Status transaksi berhasil diperbarui.');
    }

    /**
     * Manually retry fulfillment via supplier
     */
    public function retryFulfillment(Transaction $transaction)
    {
        abort_unless(in_array($transaction->status, ['failed', 'processing']), 422, 'Tidak dapat diproses ulang.');

        $transaction = $this->transactionService->processFulfillment($transaction);

        return back()->with('success', 'Transaksi sedang diproses ulang. Status: ' . $transaction->status);
    }

    /**
     * Check status from Digiflazz directly
     */
    public function checkDigiflazz(Transaction $transaction)
    {
        abort_unless($transaction->supplier === 'digiflazz' && $transaction->supplier_ref, 422);

        $data = $this->digiflazz->checkTransaction($transaction->supplier_ref);

        if (!empty($data)) {
            $status = $this->digiflazz->mapStatus($data['status'] ?? 'pending');
            $transaction->update([
                'status'           => $status,
                'sn'               => $data['sn'] ?? $transaction->sn,
                'supplier_message' => $data['message'] ?? null,
            ]);
        }

        return back()->with('success', 'Status berhasil diperbarui dari Digiflazz.');
    }
}
