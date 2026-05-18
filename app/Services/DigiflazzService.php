<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DigiflazzService
{
    private string $username;
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->username = config('toya.digiflazz.username', '');
        $this->apiKey   = config('toya.digiflazz.api_key', '');
        $this->baseUrl  = rtrim(config('toya.digiflazz.base_url', 'https://api.digiflazz.com/v1'), '/');
    }

    // ── Signature Helpers ────────────────────────────────────────────────────

    private function signDepo(): string
    {
        return md5($this->username . $this->apiKey . 'depo');
    }

    private function signTransaction(string $refId): string
    {
        return md5($this->username . $this->apiKey . $refId);
    }

    private function signPricelist(): string
    {
        return md5($this->username . $this->apiKey . 'pricelist');
    }

    // ── API Calls ─────────────────────────────────────────────────────────────

    /**
     * Get prepaid price list
     */
    public function getPriceList(string $cmd = 'prepaid'): array
    {
        try {
            $response = Http::timeout(30)->post("{$this->baseUrl}/price-list", [
                'cmd'      => $cmd,
                'username' => $this->username,
                'sign'     => $this->signPricelist(),
            ]);

            $data = $response->json();
            return $data['data'] ?? [];
        } catch (\Exception $e) {
            Log::error('Digiflazz getPriceList error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Check current deposit balance
     */
    public function checkBalance(): array
    {
        try {
            $response = Http::timeout(15)->post("{$this->baseUrl}/cek-saldo", [
                'cmd'      => 'deposit',
                'username' => $this->username,
                'sign'     => $this->signDepo(),
            ]);

            return $response->json('data', []);
        } catch (\Exception $e) {
            Log::error('Digiflazz checkBalance error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Inquiry for postpaid products (PLN, BPJS, etc.)
     */
    public function inquiry(string $customerNo, string $buyerSkuCode, string $refId): array
    {
        try {
            $response = Http::timeout(30)->post("{$this->baseUrl}/inquiry", [
                'username'       => $this->username,
                'customer_no'    => $customerNo,
                'buyer_sku_code' => $buyerSkuCode,
                'ref_id'         => $refId,
                'sign'           => $this->signTransaction($refId),
                'cmd'            => 'inq-pasca',
            ]);

            return $response->json('data', []);
        } catch (\Exception $e) {
            Log::error('Digiflazz inquiry error: ' . $e->getMessage());
            return ['rc' => 'ERROR', 'message' => $e->getMessage()];
        }
    }

    /**
     * Top up prepaid product (pulsa, data, voucher game, token listrik, etc.)
     */
    public function topUpPrepaid(string $buyerSkuCode, string $customerNo, string $refId): array
    {
        try {
            $response = Http::timeout(60)->post("{$this->baseUrl}/transaction", [
                'username'       => $this->username,
                'buyer_sku_code' => $buyerSkuCode,
                'customer_no'    => $customerNo,
                'ref_id'         => $refId,
                'sign'           => $this->signTransaction($refId),
                'cmd'            => 'transaction',
                'testing'        => config('app.env') !== 'production',
            ]);

            $data = $response->json('data', []);
            Log::info('Digiflazz topUpPrepaid', ['ref_id' => $refId, 'response' => $data]);
            return $data;
        } catch (\Exception $e) {
            Log::error('Digiflazz topUpPrepaid error: ' . $e->getMessage());
            return ['rc' => 'ERROR', 'message' => $e->getMessage(), 'status' => 'Gagal'];
        }
    }

    /**
     * Pay postpaid product (PLN pasca, BPJS, etc.)
     */
    public function payPostpaid(string $buyerSkuCode, string $customerNo, string $refId): array
    {
        try {
            $response = Http::timeout(60)->post("{$this->baseUrl}/transaction", [
                'username'       => $this->username,
                'buyer_sku_code' => $buyerSkuCode,
                'customer_no'    => $customerNo,
                'ref_id'         => $refId,
                'sign'           => $this->signTransaction($refId),
                'cmd'            => 'pay-pasca',
                'testing'        => config('app.env') !== 'production',
            ]);

            $data = $response->json('data', []);
            Log::info('Digiflazz payPostpaid', ['ref_id' => $refId, 'response' => $data]);
            return $data;
        } catch (\Exception $e) {
            Log::error('Digiflazz payPostpaid error: ' . $e->getMessage());
            return ['rc' => 'ERROR', 'message' => $e->getMessage(), 'status' => 'Gagal'];
        }
    }

    /**
     * Check transaction status
     */
    public function checkTransaction(string $refId): array
    {
        try {
            $response = Http::timeout(15)->post("{$this->baseUrl}/transaction", [
                'username' => $this->username,
                'ref_id'   => $refId,
                'sign'     => $this->signTransaction($refId),
                'cmd'      => 'inquiry-transaction',
            ]);

            return $response->json('data', []);
        } catch (\Exception $e) {
            Log::error('Digiflazz checkTransaction error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Map Digiflazz status to internal status
     */
    public function mapStatus(string $digiStatus): string
    {
        return match(strtolower($digiStatus)) {
            'sukses'     => 'success',
            'gagal'      => 'failed',
            'pending'    => 'processing',
            'waiting'    => 'processing',
            default      => 'processing',
        };
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhook(array $payload): bool
    {
        $secret    = config('toya.digiflazz.webhook_secret', '');
        $sign      = $payload['sign'] ?? '';
        $expected  = md5($this->username . $secret . ($payload['ref_id'] ?? ''));
        return hash_equals($expected, $sign);
    }
}
