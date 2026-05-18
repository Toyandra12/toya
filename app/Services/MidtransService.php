<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use Midtrans\Notification;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('toya.midtrans.server_key');
        Config::$clientKey    = config('toya.midtrans.client_key');
        Config::$isProduction = config('toya.midtrans.is_production', false);
        Config::$isSanitized  = config('toya.midtrans.is_sanitized', true);
        Config::$is3ds        = config('toya.midtrans.is_3ds', true);
    }

    /**
     * Create Snap transaction for product purchase
     */
    public function createSnapTransaction(
        string $orderId,
        float $amount,
        array $customerDetails,
        array $itemDetails = [],
        array $callbacks = []
    ): array {
        try {
            $params = [
                'transaction_details' => [
                    'order_id'     => $orderId,
                    'gross_amount' => (int) $amount,
                ],
                'customer_details' => [
                    'first_name' => $customerDetails['name'] ?? 'Customer',
                    'email'      => $customerDetails['email'] ?? '',
                    'phone'      => $customerDetails['phone'] ?? '',
                ],
                'item_details' => $itemDetails,
                'expiry'       => [
                    'unit'     => 'hours',
                    'duration' => 24,
                ],
            ];

            if (!empty($callbacks)) {
                $params['callbacks'] = $callbacks;
            }

            $snapResponse = Snap::createTransaction($params);

            return [
                'success'   => true,
                'token'     => $snapResponse->token,
                'redirect_url' => $snapResponse->redirect_url,
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans createSnapTransaction error: ' . $e->getMessage(), ['order_id' => $orderId]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create Snap transaction for saldo top-up
     */
    public function createSaldoTopupSnap(
        string $orderId,
        float $amount,
        array $customerDetails
    ): array {
        return $this->createSnapTransaction($orderId, $amount, $customerDetails, [
            [
                'id'       => 'saldo-topup',
                'price'    => (int) $amount,
                'quantity' => 1,
                'name'     => 'Top Up Saldo Akun',
            ],
        ]);
    }

    /**
     * Handle payment notification from Midtrans webhook
     */
    public function handleNotification(): array
    {
        try {
            $notification = new Notification();

            $orderId           = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus       = $notification->fraud_status;
            $paymentType       = $notification->payment_type;
            $transactionId     = $notification->transaction_id;

            $paymentStatus = $this->resolvePaymentStatus($transactionStatus, $fraudStatus);

            return [
                'success'           => true,
                'order_id'          => $orderId,
                'transaction_id'    => $transactionId,
                'payment_type'      => $paymentType,
                'transaction_status'=> $transactionStatus,
                'fraud_status'      => $fraudStatus,
                'payment_status'    => $paymentStatus,
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans handleNotification error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Check transaction status directly from Midtrans
     */
    public function checkStatus(string $orderId): array
    {
        try {
            $status = Transaction::status($orderId);
            return (array) $status;
        } catch (\Exception $e) {
            Log::error('Midtrans checkStatus error: ' . $e->getMessage(), ['order_id' => $orderId]);
            return [];
        }
    }

    /**
     * Resolve to internal payment status
     */
    public function resolvePaymentStatus(string $transactionStatus, ?string $fraudStatus = null): string
    {
        if ($transactionStatus === 'capture') {
            return ($fraudStatus === 'accept') ? 'paid' : 'failed';
        }

        return match($transactionStatus) {
            'settlement' => 'paid',
            'pending'    => 'pending',
            'deny', 'cancel', 'expire', 'failure' => 'failed',
            'refund', 'partial_refund' => 'refunded',
            default => 'pending',
        };
    }

    /**
     * Verify notification signature key
     */
    public function verifySignatureKey(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $serverKey = config('toya.midtrans.server_key');
        $expected  = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        return hash_equals($expected, $signatureKey);
    }
}
