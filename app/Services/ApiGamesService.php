<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * API Games (apigames.id) integration service
 *
 * Endpoints pattern:
 *   POST /api/order         - place game top-up order
 *   POST /api/inquiry       - inquiry account/user info
 *   GET  /api/products      - list products
 *   GET  /api/status/{trxId}- check order status
 *
 * Auth: Each request includes merchantId + sign = md5(merchantId + secret + refId)
 */
class ApiGamesService
{
    private string $merchantId;
    private string $secret;
    private string $baseUrl;

    public function __construct()
    {
        $this->merchantId = config('toya.apigames.merchant_id', '');
        $this->secret     = config('toya.apigames.secret', '');
        $this->baseUrl    = rtrim(config('toya.apigames.base_url', 'https://api.apigames.id'), '/');
    }

    private function sign(string $refId): string
    {
        return md5($this->merchantId . $this->secret . $refId);
    }

    /**
     * Inquiry – verify account info before placing order
     * (e.g., validate User ID + Zone ID for Mobile Legends)
     */
    public function inquiry(string $productCode, string $userId, string $serverId = ''): array
    {
        try {
            $response = Http::timeout(20)->post("{$this->baseUrl}/api/inquiry", [
                'merchant_id'  => $this->merchantId,
                'product_code' => $productCode,
                'user_id'      => $userId,
                'zone_id'      => $serverId,
                'sign'         => $this->sign($userId),
            ]);

            return $response->json() ?? [];
        } catch (\Exception $e) {
            Log::error('ApiGames inquiry error: ' . $e->getMessage());
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Place a top-up order
     */
    public function order(
        string $refId,
        string $productCode,
        string $userId,
        string $serverId = ''
    ): array {
        try {
            $response = Http::timeout(60)->post("{$this->baseUrl}/api/order", [
                'merchant_id'  => $this->merchantId,
                'ref_id'       => $refId,
                'product_code' => $productCode,
                'user_id'      => $userId,
                'zone_id'      => $serverId,
                'sign'         => $this->sign($refId),
            ]);

            $data = $response->json();
            Log::info('ApiGames order', ['ref_id' => $refId, 'response' => $data]);
            return $data ?? [];
        } catch (\Exception $e) {
            Log::error('ApiGames order error: ' . $e->getMessage());
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Check order status
     */
    public function checkStatus(string $trxId): array
    {
        try {
            $response = Http::timeout(15)->get("{$this->baseUrl}/api/status/{$trxId}", [
                'merchant_id' => $this->merchantId,
                'sign'        => $this->sign($trxId),
            ]);

            return $response->json() ?? [];
        } catch (\Exception $e) {
            Log::error('ApiGames checkStatus error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get product list from API Games
     */
    public function getProducts(string $gameCode = ''): array
    {
        try {
            $response = Http::timeout(15)->get("{$this->baseUrl}/api/products", [
                'merchant_id' => $this->merchantId,
                'game_code'   => $gameCode,
                'sign'        => $this->sign($gameCode),
            ]);

            return $response->json('data', []);
        } catch (\Exception $e) {
            Log::error('ApiGames getProducts error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Map API Games status to internal status
     */
    public function mapStatus(mixed $status): string
    {
        $s = strtolower((string)$status);
        return match($s) {
            'success', 'sukses', '1', 'completed' => 'success',
            'failed', 'gagal', '0', 'error'       => 'failed',
            default                                => 'processing',
        };
    }
}
