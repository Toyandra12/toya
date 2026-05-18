<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Voucher;
use App\Models\SaldoHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionService
{
    public function __construct(
        private DigiflazzService $digiflazz,
        private ApiGamesService  $apiGames,
        private MidtransService  $midtrans,
    ) {}

    /**
     * Create a new transaction (before payment)
     */
    public function createTransaction(
        User    $user,
        Product $product,
        string  $customerNo,
        array   $customerData = [],
        string  $paymentMethod = 'midtrans',
        ?string $voucherCode = null,
        bool    $isGift = false,
        array   $giftData = []
    ): Transaction {
        return DB::transaction(function () use (
            $user, $product, $customerNo, $customerData,
            $paymentMethod, $voucherCode, $isGift, $giftData
        ) {
            $sellPrice = $product->effective_price;
            $adminFee  = 0;
            $discount  = 0;

            // Apply voucher
            if ($voucherCode) {
                $voucher = Voucher::where('code', $voucherCode)->first();
                if ($voucher && $voucher->isValid($user->id, $sellPrice)) {
                    $discount = $voucher->calculateDiscount($sellPrice);
                }
            }

            $totalAmount = $sellPrice + $adminFee - $discount;

            $transaction = Transaction::create([
                'invoice_number'          => Transaction::generateInvoice(),
                'user_id'                 => $user->id,
                'product_id'              => $product->id,
                'customer_no'             => $customerNo,
                'customer_data'           => $customerData,
                'is_gift'                 => $isGift,
                'gift_recipient_contact'  => $giftData['recipient_contact'] ?? null,
                'gift_message'            => $giftData['message'] ?? null,
                'gift_recipient_user_id'  => $giftData['recipient_user_id'] ?? null,
                'sell_price'              => $sellPrice,
                'admin_fee'               => $adminFee,
                'discount'                => $discount,
                'total_amount'            => $totalAmount,
                'payment_method'          => $paymentMethod,
                'payment_status'          => 'pending',
                'status'                  => 'pending',
                'supplier'                => $product->supplier,
            ]);

            return $transaction;
        });
    }

    /**
     * Create Midtrans Snap payment token
     */
    public function createMidtransPayment(Transaction $transaction): array
    {
        $user    = $transaction->user;
        $product = $transaction->product;

        $result = $this->midtrans->createSnapTransaction(
            $transaction->invoice_number,
            $transaction->total_amount,
            [
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ],
            [
                [
                    'id'       => $product->sku,
                    'price'    => (int) $transaction->sell_price,
                    'quantity' => 1,
                    'name'     => $product->name,
                ],
            ]
        );

        if ($result['success']) {
            $transaction->update([
                'midtrans_order_id'   => $transaction->invoice_number,
                'midtrans_snap_token' => $result['token'],
                'midtrans_snap_url'   => $result['redirect_url'],
            ]);
        }

        return $result;
    }

    /**
     * Pay via saldo
     */
    public function payWithSaldo(Transaction $transaction): bool
    {
        $user = $transaction->user;
        if ($user->saldo < $transaction->total_amount) {
            return false;
        }

        DB::transaction(function () use ($user, $transaction) {
            $before = $user->saldo;
            $user->decrement('saldo', $transaction->total_amount);
            $user->refresh();

            SaldoHistory::create([
                'user_id'        => $user->id,
                'type'           => 'debit',
                'amount'         => $transaction->total_amount,
                'balance_before' => $before,
                'balance_after'  => $user->saldo,
                'description'    => 'Pembayaran ' . $transaction->invoice_number,
                'reference_type' => 'transaction',
                'reference_id'   => $transaction->id,
            ]);

            $transaction->update([
                'payment_status' => 'paid',
                'status'         => 'paid',
                'paid_at'        => now(),
            ]);
        });

        return true;
    }

    /**
     * Process fulfillment (called after payment confirmed)
     */
    public function processFulfillment(Transaction $transaction): Transaction
    {
        $transaction->update(['status' => 'processing']);

        try {
            $product  = $transaction->product;
            $supplierRef = 'REF-' . $transaction->id . '-' . now()->timestamp;

            $transaction->update(['supplier_ref' => $supplierRef]);

            $result = match($product->supplier) {
                'digiflazz' => $this->processDigiflazz($transaction, $product, $supplierRef),
                'apigames'  => $this->processApiGames($transaction, $product, $supplierRef),
                'manual'    => ['status' => 'processing', 'message' => 'Menunggu proses manual'],
                default     => ['status' => 'failed', 'message' => 'Supplier tidak dikenal'],
            };

            $this->updateFromSupplierResult($transaction, $result);
        } catch (\Exception $e) {
            Log::error('Fulfillment error: ' . $e->getMessage(), ['transaction_id' => $transaction->id]);
            $transaction->update([
                'status'           => 'failed',
                'supplier_message' => $e->getMessage(),
            ]);
        }

        return $transaction->refresh();
    }

    private function processDigiflazz(Transaction $transaction, Product $product, string $refId): array
    {
        $customerNo = $transaction->customer_no;

        if ($product->type === 'postpaid') {
            $data = $this->digiflazz->payPostpaid($product->supplier_code, $customerNo, $refId);
        } else {
            $data = $this->digiflazz->topUpPrepaid($product->supplier_code, $customerNo, $refId);
        }

        return [
            'supplier_trx_id'  => $data['trxid'] ?? null,
            'supplier_message' => $data['message'] ?? null,
            'sn'               => $data['sn'] ?? null,
            'status'           => $this->digiflazz->mapStatus($data['status'] ?? 'pending'),
        ];
    }

    private function processApiGames(Transaction $transaction, Product $product, string $refId): array
    {
        $customerData = $transaction->customer_data ?? [];
        $userId       = $transaction->customer_no;
        $serverId     = $customerData['zone_id'] ?? $customerData['server_id'] ?? '';

        $data = $this->apiGames->order($refId, $product->supplier_code, $userId, $serverId);

        return [
            'supplier_trx_id'  => $data['trx_id'] ?? $data['order_id'] ?? null,
            'supplier_message' => $data['message'] ?? null,
            'sn'               => $data['sn'] ?? null,
            'status'           => $this->apiGames->mapStatus($data['status'] ?? 0),
        ];
    }

    private function updateFromSupplierResult(Transaction $transaction, array $result): void
    {
        $transaction->update([
            'supplier_trx_id'  => $result['supplier_trx_id'] ?? null,
            'supplier_message' => $result['supplier_message'] ?? null,
            'sn'               => $result['sn'] ?? null,
            'status'           => $result['status'] ?? 'processing',
            'processed_at'     => now(),
        ]);
    }
}
