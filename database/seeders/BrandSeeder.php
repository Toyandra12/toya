<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            // Game Top Up
            ['category' => 'game-top-up', 'name' => 'Mobile Legends',  'slug' => 'mobile-legends',  'game_code' => 'mobilelegends', 'is_featured' => true, 'sort_order' => 1,
             'form_fields' => [['name' => 'user_id', 'label' => 'User ID', 'required' => true], ['name' => 'zone_id', 'label' => 'Zone ID', 'required' => true]]],
            ['category' => 'game-top-up', 'name' => 'Free Fire',        'slug' => 'free-fire',        'game_code' => 'freefire',      'is_featured' => true, 'sort_order' => 2,
             'form_fields' => [['name' => 'user_id', 'label' => 'Player ID', 'required' => true]]],
            ['category' => 'game-top-up', 'name' => 'PUBG Mobile',      'slug' => 'pubg-mobile',      'game_code' => 'pubgm',         'is_featured' => true, 'sort_order' => 3,
             'form_fields' => [['name' => 'user_id', 'label' => 'Character ID', 'required' => true]]],
            ['category' => 'game-top-up', 'name' => 'Genshin Impact',   'slug' => 'genshin-impact',   'game_code' => 'genshin',       'is_featured' => true, 'sort_order' => 4,
             'form_fields' => [['name' => 'user_id', 'label' => 'UID', 'required' => true], ['name' => 'zone_id', 'label' => 'Server', 'required' => true]]],
            ['category' => 'game-top-up', 'name' => 'Valorant',         'slug' => 'valorant',         'game_code' => 'valorant',      'is_featured' => false, 'sort_order' => 5,
             'form_fields' => [['name' => 'user_id', 'label' => 'Riot ID', 'required' => true]]],
            ['category' => 'game-top-up', 'name' => 'Honor of Kings',   'slug' => 'honor-of-kings',   'game_code' => 'hok',           'is_featured' => false, 'sort_order' => 6,
             'form_fields' => [['name' => 'user_id', 'label' => 'Open ID', 'required' => true], ['name' => 'zone_id', 'label' => 'Area ID', 'required' => true]]],

            // Pulsa
            ['category' => 'pulsa', 'name' => 'Telkomsel',   'slug' => 'pulsa-telkomsel',   'sort_order' => 1, 'is_featured' => true,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor Telepon', 'required' => true, 'type' => 'tel']]],
            ['category' => 'pulsa', 'name' => 'Indosat',     'slug' => 'pulsa-indosat',     'sort_order' => 2, 'is_featured' => true,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor Telepon', 'required' => true, 'type' => 'tel']]],
            ['category' => 'pulsa', 'name' => 'XL/Axis',     'slug' => 'pulsa-xl-axis',     'sort_order' => 3,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor Telepon', 'required' => true, 'type' => 'tel']]],
            ['category' => 'pulsa', 'name' => 'Tri (3)',      'slug' => 'pulsa-tri',         'sort_order' => 4,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor Telepon', 'required' => true, 'type' => 'tel']]],
            ['category' => 'pulsa', 'name' => 'Smartfren',   'slug' => 'pulsa-smartfren',   'sort_order' => 5,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor Telepon', 'required' => true, 'type' => 'tel']]],

            // Paket Data
            ['category' => 'paket-data', 'name' => 'Telkomsel Data', 'slug' => 'data-telkomsel', 'sort_order' => 1, 'is_featured' => true,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor Telepon', 'required' => true, 'type' => 'tel']]],
            ['category' => 'paket-data', 'name' => 'Indosat Data',   'slug' => 'data-indosat',   'sort_order' => 2, 'is_featured' => true,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor Telepon', 'required' => true, 'type' => 'tel']]],
            ['category' => 'paket-data', 'name' => 'XL/Axis Data',  'slug' => 'data-xl-axis',   'sort_order' => 3,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor Telepon', 'required' => true, 'type' => 'tel']]],

            // Token Listrik
            ['category' => 'token-listrik', 'name' => 'PLN Token', 'slug' => 'pln-token', 'sort_order' => 1, 'is_featured' => true,
             'form_fields' => [['name' => 'meter_number', 'label' => 'Nomor Meter', 'required' => true]]],

            // PLN Pascabayar
            ['category' => 'pln-pascabayar', 'name' => 'PLN Pascabayar', 'slug' => 'pln-pasca', 'sort_order' => 1,
             'form_fields' => [['name' => 'id_pelanggan', 'label' => 'ID Pelanggan', 'required' => true]]],

            // BPJS
            ['category' => 'bpjs-kesehatan', 'name' => 'BPJS Kesehatan', 'slug' => 'bpjs', 'sort_order' => 1, 'is_featured' => true,
             'form_fields' => [['name' => 'va_number', 'label' => 'Nomor VA BPJS', 'required' => true]]],

            // E-Money
            ['category' => 'e-money', 'name' => 'GoPay',   'slug' => 'gopay',   'sort_order' => 1, 'is_featured' => true,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor GoPay', 'required' => true, 'type' => 'tel']]],
            ['category' => 'e-money', 'name' => 'OVO',     'slug' => 'ovo',     'sort_order' => 2, 'is_featured' => true,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor OVO', 'required' => true, 'type' => 'tel']]],
            ['category' => 'e-money', 'name' => 'Dana',    'slug' => 'dana',    'sort_order' => 3,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor Dana', 'required' => true, 'type' => 'tel']]],
            ['category' => 'e-money', 'name' => 'ShopeePay', 'slug' => 'shopeepay', 'sort_order' => 4,
             'form_fields' => [['name' => 'phone', 'label' => 'Nomor ShopeePay', 'required' => true, 'type' => 'tel']]],

            // Streaming
            ['category' => 'streaming', 'name' => 'Netflix',  'slug' => 'netflix',  'sort_order' => 1,
             'form_fields' => [['name' => 'email', 'label' => 'Email Netflix', 'required' => true, 'type' => 'email']]],
            ['category' => 'streaming', 'name' => 'Spotify',  'slug' => 'spotify',  'sort_order' => 2,
             'form_fields' => [['name' => 'email', 'label' => 'Email Spotify', 'required' => true, 'type' => 'email']]],
            ['category' => 'streaming', 'name' => 'Disney+',  'slug' => 'disneyplus','sort_order' => 3,
             'form_fields' => [['name' => 'email', 'label' => 'Email Disney+', 'required' => true, 'type' => 'email']]],
        ];

        foreach ($brands as $brandData) {
            $category = Category::where('slug', $brandData['category'])->first();
            if (!$category) continue;

            Brand::updateOrCreate(
                ['slug' => $brandData['slug']],
                [
                    'category_id' => $category->id,
                    'name'        => $brandData['name'],
                    'slug'        => $brandData['slug'],
                    'game_code'   => $brandData['game_code'] ?? null,
                    'form_fields' => $brandData['form_fields'] ?? null,
                    'sort_order'  => $brandData['sort_order'] ?? 0,
                    'is_active'   => true,
                    'is_featured' => $brandData['is_featured'] ?? false,
                ]
            );
        }
    }
}
