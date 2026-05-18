<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        $vouchers = [
            [
                'code'           => 'WELCOME10',
                'name'           => 'Diskon Selamat Datang',
                'description'    => 'Diskon 10% untuk transaksi pertama',
                'discount_type'  => 'percent',
                'discount_value' => 10,
                'max_discount'   => 15000,
                'min_transaction'=> 10000,
                'quota'          => 100,
                'per_user_limit' => 1,
                'is_active'      => true,
            ],
            [
                'code'           => 'HEMAT5K',
                'name'           => 'Hemat 5000',
                'description'    => 'Potongan Rp 5.000 untuk semua transaksi di atas Rp 50.000',
                'discount_type'  => 'fixed',
                'discount_value' => 5000,
                'min_transaction'=> 50000,
                'quota'          => -1,
                'per_user_limit' => 3,
                'is_active'      => true,
            ],
            [
                'code'           => 'GAME20',
                'name'           => 'Diskon Game 20%',
                'description'    => 'Diskon 20% untuk top up game (max Rp 25.000)',
                'discount_type'  => 'percent',
                'discount_value' => 20,
                'max_discount'   => 25000,
                'min_transaction'=> 5000,
                'quota'          => 50,
                'per_user_limit' => 1,
                'is_active'      => true,
            ],
        ];

        foreach ($vouchers as $v) {
            Voucher::updateOrCreate(['code' => $v['code']], $v);
        }
    }
}
