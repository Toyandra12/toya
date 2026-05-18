<?php

namespace Database\Seeders;

use App\Models\Slider;
use Illuminate\Database\Seeder;

class SliderSeeder extends Seeder
{
    public function run(): void
    {
        $sliders = [
            [
                'title'       => 'Top Up Game Murah & Cepat',
                'subtitle'    => 'Ribuan produk digital tersedia. Proses instan 24 jam.',
                'image'       => 'sliders/placeholder-1.jpg',
                'link'        => '/kategori/game-top-up',
                'button_text' => 'Top Up Sekarang',
                'badge'       => 'Terlaris',
                'badge_color' => 'bg-yellow-400',
                'sort_order'  => 1,
                'is_active'   => true,
            ],
            [
                'title'       => 'Bayar BPJS Lebih Mudah',
                'subtitle'    => 'Bayar iuran BPJS langsung dari sini. Aman & terpercaya.',
                'image'       => 'sliders/placeholder-2.jpg',
                'link'        => '/kategori/bpjs-kesehatan',
                'button_text' => 'Bayar BPJS',
                'badge'       => 'PPOB',
                'badge_color' => 'bg-blue-500',
                'sort_order'  => 2,
                'is_active'   => true,
            ],
            [
                'title'       => 'Token Listrik PLN Instant',
                'subtitle'    => 'Beli token listrik PLN sekarang, langsung terima nomor token.',
                'image'       => 'sliders/placeholder-3.jpg',
                'link'        => '/kategori/token-listrik',
                'button_text' => 'Beli Token',
                'badge'       => 'Promo',
                'badge_color' => 'bg-green-500',
                'sort_order'  => 3,
                'is_active'   => true,
            ],
        ];

        foreach ($sliders as $slider) {
            Slider::updateOrCreate(['title' => $slider['title']], $slider);
        }
    }
}
