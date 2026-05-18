<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Toya Application Config
    |--------------------------------------------------------------------------
    */

    'name'             => env('APP_NAME', 'Toya'),
    'logo'             => env('APP_LOGO', null),
    'favicon'          => env('APP_FAVICON', null),
    'meta_description' => env('APP_META_DESCRIPTION', 'Platform Top Up dan PPOB Digital Terpercaya'),
    'default_markup'   => (float) env('DEFAULT_MARKUP_PERCENT', 5),

    /*
    |--------------------------------------------------------------------------
    | Midtrans
    |--------------------------------------------------------------------------
    */
    'midtrans' => [
        'server_key'    => env('MIDTRANS_SERVER_KEY'),
        'client_key'    => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        'is_sanitized'  => env('MIDTRANS_IS_SANITIZED', true),
        'is_3ds'        => env('MIDTRANS_IS_3DS', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Digiflazz
    |--------------------------------------------------------------------------
    */
    'digiflazz' => [
        'username'        => env('DIGIFLAZZ_USERNAME'),
        'api_key'         => env('DIGIFLAZZ_API_KEY'),
        'base_url'        => env('DIGIFLAZZ_BASE_URL', 'https://api.digiflazz.com/v1'),
        'webhook_secret'  => env('DIGIFLAZZ_WEBHOOK_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | API Games
    |--------------------------------------------------------------------------
    */
    'apigames' => [
        'merchant_id'   => env('APIGAMES_MERCHANT_ID'),
        'secret'        => env('APIGAMES_SECRET'),
        'base_url'      => env('APIGAMES_BASE_URL', 'https://api.apigames.id'),
        'is_production' => env('APIGAMES_IS_PRODUCTION', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Transaction Statuses
    |--------------------------------------------------------------------------
    */
    'transaction_statuses' => [
        'pending'    => 'Menunggu Pembayaran',
        'paid'       => 'Dibayar',
        'processing' => 'Sedang Diproses',
        'success'    => 'Berhasil',
        'failed'     => 'Gagal',
        'refunded'   => 'Dikembalikan',
        'cancelled'  => 'Dibatalkan',
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Methods
    |--------------------------------------------------------------------------
    */
    'payment_methods' => [
        'midtrans'  => 'Midtrans (Transfer/VA/QRIS)',
        'saldo'     => 'Saldo Akun',
        'manual'    => 'Manual (Admin)',
    ],
];
