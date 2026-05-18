<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Game Top Up',     'slug' => 'game-top-up',     'icon' => '🎮', 'type' => 'game',    'sort_order' => 1,  'is_featured' => true],
            ['name' => 'Pulsa',           'slug' => 'pulsa',           'icon' => '📱', 'type' => 'digital', 'sort_order' => 2,  'is_featured' => true],
            ['name' => 'Paket Data',      'slug' => 'paket-data',      'icon' => '📶', 'type' => 'digital', 'sort_order' => 3,  'is_featured' => true],
            ['name' => 'Token Listrik',   'slug' => 'token-listrik',   'icon' => '⚡', 'type' => 'ppob',    'sort_order' => 4,  'is_featured' => true],
            ['name' => 'PLN Pascabayar',  'slug' => 'pln-pascabayar',  'icon' => '💡', 'type' => 'ppob',    'sort_order' => 5],
            ['name' => 'BPJS Kesehatan',  'slug' => 'bpjs-kesehatan',  'icon' => '🏥', 'type' => 'ppob',    'sort_order' => 6,  'is_featured' => true],
            ['name' => 'E-Money',         'slug' => 'e-money',         'icon' => '💳', 'type' => 'digital', 'sort_order' => 7],
            ['name' => 'Voucher',         'slug' => 'voucher',         'icon' => '🎟️', 'type' => 'digital', 'sort_order' => 8],
            ['name' => 'Streaming',       'slug' => 'streaming',       'icon' => '📺', 'type' => 'digital', 'sort_order' => 9],
            ['name' => 'PDAM',            'slug' => 'pdam',            'icon' => '🚰', 'type' => 'ppob',    'sort_order' => 10],
            ['name' => 'Internet',        'slug' => 'internet',        'icon' => '🌐', 'type' => 'ppob',    'sort_order' => 11],
            ['name' => 'Asuransi',        'slug' => 'asuransi',        'icon' => '🛡️', 'type' => 'ppob',    'sort_order' => 12],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                array_merge($cat, ['is_active' => true, 'is_featured' => $cat['is_featured'] ?? false])
            );
        }
    }
}
