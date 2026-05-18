<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedGameProducts();
        $this->seedPulsaProducts();
        $this->seedDataProducts();
        $this->seedTokenListrik();
        $this->seedBPJS();
    }

    private function seedGameProducts(): void
    {
        $ml = Brand::where('slug', 'mobile-legends')->first();
        $ff = Brand::where('slug', 'free-fire')->first();

        if ($ml) {
            $mlProducts = [
                ['name' => '5 Diamonds',    'sku' => 'ML-DM-5',    'base_price' => 1410,   'sell_price' => 1500,  'supplier_code' => 'mobilelegends5diamonds'],
                ['name' => '11 Diamonds',   'sku' => 'ML-DM-11',   'base_price' => 2700,   'sell_price' => 2900,  'supplier_code' => 'mobilelegends11diamonds'],
                ['name' => '22 Diamonds',   'sku' => 'ML-DM-22',   'base_price' => 5300,   'sell_price' => 5500,  'supplier_code' => 'mobilelegends22diamonds'],
                ['name' => '56 Diamonds',   'sku' => 'ML-DM-56',   'base_price' => 13000,  'sell_price' => 13500, 'supplier_code' => 'mobilelegends56diamonds'],
                ['name' => '112 Diamonds',  'sku' => 'ML-DM-112',  'base_price' => 26000,  'sell_price' => 27000, 'supplier_code' => 'mobilelegends112diamonds'],
                ['name' => '222 Diamonds',  'sku' => 'ML-DM-222',  'base_price' => 50000,  'sell_price' => 52000, 'supplier_code' => 'mobilelegends222diamonds'],
                ['name' => '570 Diamonds',  'sku' => 'ML-DM-570',  'base_price' => 130000, 'sell_price' => 135000,'supplier_code' => 'mobilelegends570diamonds', 'is_featured' => true],
                ['name' => '1144 Diamonds', 'sku' => 'ML-DM-1144', 'base_price' => 265000, 'sell_price' => 275000,'supplier_code' => 'mobilelegends1144diamonds'],
                ['name' => 'Weekly Diamond Pass', 'sku' => 'ML-WDP', 'base_price' => 28500, 'sell_price' => 29500, 'supplier_code' => 'mlweeklydiamondpass'],
            ];

            foreach ($mlProducts as $p) {
                Product::updateOrCreate(['sku' => $p['sku']], [
                    'category_id'   => $ml->category_id,
                    'brand_id'      => $ml->id,
                    'name'          => $p['name'],
                    'sku'           => $p['sku'],
                    'supplier'      => 'digiflazz',
                    'supplier_code' => $p['supplier_code'],
                    'base_price'    => $p['base_price'],
                    'sell_price'    => $p['sell_price'],
                    'type'          => 'prepaid',
                    'is_active'     => true,
                    'is_featured'   => $p['is_featured'] ?? false,
                    'stock'         => -1,
                ]);
            }
        }

        if ($ff) {
            $ffProducts = [
                ['name' => '5 Diamonds FF',    'sku' => 'FF-DM-5',    'base_price' => 1410,   'sell_price' => 1500,  'supplier_code' => 'freefire5diamonds'],
                ['name' => '70 Diamonds FF',   'sku' => 'FF-DM-70',   'base_price' => 16000,  'sell_price' => 16500, 'supplier_code' => 'freefire70diamonds'],
                ['name' => '140 Diamonds FF',  'sku' => 'FF-DM-140',  'base_price' => 30500,  'sell_price' => 31500, 'supplier_code' => 'freefire140diamonds'],
                ['name' => '355 Diamonds FF',  'sku' => 'FF-DM-355',  'base_price' => 76000,  'sell_price' => 79000, 'supplier_code' => 'freefire355diamonds'],
                ['name' => '720 Diamonds FF',  'sku' => 'FF-DM-720',  'base_price' => 152000, 'sell_price' => 157000,'supplier_code' => 'freefire720diamonds'],
            ];

            foreach ($ffProducts as $p) {
                Product::updateOrCreate(['sku' => $p['sku']], [
                    'category_id'   => $ff->category_id,
                    'brand_id'      => $ff->id,
                    'name'          => $p['name'],
                    'sku'           => $p['sku'],
                    'supplier'      => 'digiflazz',
                    'supplier_code' => $p['supplier_code'],
                    'base_price'    => $p['base_price'],
                    'sell_price'    => $p['sell_price'],
                    'type'          => 'prepaid',
                    'is_active'     => true,
                    'stock'         => -1,
                ]);
            }
        }
    }

    private function seedPulsaProducts(): void
    {
        $brand = Brand::where('slug', 'pulsa-telkomsel')->first();
        if (!$brand) return;

        $products = [
            ['name' => 'Pulsa Telkomsel Rp 5.000',   'sku' => 'TSEL-5K',   'base_price' => 5500,  'sell_price' => 5750,  'supplier_code' => 'TSEL5'],
            ['name' => 'Pulsa Telkomsel Rp 10.000',  'sku' => 'TSEL-10K',  'base_price' => 10500, 'sell_price' => 10750, 'supplier_code' => 'TSEL10'],
            ['name' => 'Pulsa Telkomsel Rp 20.000',  'sku' => 'TSEL-20K',  'base_price' => 20500, 'sell_price' => 20900, 'supplier_code' => 'TSEL20'],
            ['name' => 'Pulsa Telkomsel Rp 50.000',  'sku' => 'TSEL-50K',  'base_price' => 50500, 'sell_price' => 51000, 'supplier_code' => 'TSEL50'],
            ['name' => 'Pulsa Telkomsel Rp 100.000', 'sku' => 'TSEL-100K', 'base_price' => 100500,'sell_price' => 101500,'supplier_code' => 'TSEL100'],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['sku' => $p['sku']], [
                'category_id'   => $brand->category_id,
                'brand_id'      => $brand->id,
                'name'          => $p['name'],
                'sku'           => $p['sku'],
                'supplier'      => 'digiflazz',
                'supplier_code' => $p['supplier_code'],
                'base_price'    => $p['base_price'],
                'sell_price'    => $p['sell_price'],
                'type'          => 'prepaid',
                'is_active'     => true,
                'stock'         => -1,
            ]);
        }
    }

    private function seedDataProducts(): void
    {
        $brand = Brand::where('slug', 'data-telkomsel')->first();
        if (!$brand) return;

        $products = [
            ['name' => 'Telkomsel 1GB 7 Hari',   'sku' => 'TSEL-DATA-1G-7D',  'base_price' => 13500, 'sell_price' => 14000, 'supplier_code' => 'TSELD1GB7'],
            ['name' => 'Telkomsel 2GB 30 Hari',  'sku' => 'TSEL-DATA-2G-30D', 'base_price' => 25000, 'sell_price' => 26000, 'supplier_code' => 'TSELD2GB30'],
            ['name' => 'Telkomsel 5GB 30 Hari',  'sku' => 'TSEL-DATA-5G-30D', 'base_price' => 50000, 'sell_price' => 52000, 'supplier_code' => 'TSELD5GB30'],
            ['name' => 'Telkomsel 10GB 30 Hari', 'sku' => 'TSEL-DATA-10G-30D','base_price' => 90000, 'sell_price' => 93000, 'supplier_code' => 'TSELD10GB30'],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['sku' => $p['sku']], [
                'category_id'   => $brand->category_id,
                'brand_id'      => $brand->id,
                'name'          => $p['name'],
                'sku'           => $p['sku'],
                'supplier'      => 'digiflazz',
                'supplier_code' => $p['supplier_code'],
                'base_price'    => $p['base_price'],
                'sell_price'    => $p['sell_price'],
                'type'          => 'prepaid',
                'is_active'     => true,
                'stock'         => -1,
            ]);
        }
    }

    private function seedTokenListrik(): void
    {
        $brand = Brand::where('slug', 'pln-token')->first();
        if (!$brand) return;

        $products = [
            ['name' => 'Token PLN Rp 20.000',  'sku' => 'PLN-20K',  'base_price' => 19500, 'sell_price' => 20500, 'supplier_code' => 'PLNPRE20000'],
            ['name' => 'Token PLN Rp 50.000',  'sku' => 'PLN-50K',  'base_price' => 49500, 'sell_price' => 51000, 'supplier_code' => 'PLNPRE50000'],
            ['name' => 'Token PLN Rp 100.000', 'sku' => 'PLN-100K', 'base_price' => 99500, 'sell_price' => 101500,'supplier_code' => 'PLNPRE100000'],
            ['name' => 'Token PLN Rp 200.000', 'sku' => 'PLN-200K', 'base_price' => 199500,'sell_price' => 202000,'supplier_code' => 'PLNPRE200000'],
            ['name' => 'Token PLN Rp 500.000', 'sku' => 'PLN-500K', 'base_price' => 499500,'sell_price' => 504000,'supplier_code' => 'PLNPRE500000'],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['sku' => $p['sku']], [
                'category_id'   => $brand->category_id,
                'brand_id'      => $brand->id,
                'name'          => $p['name'],
                'sku'           => $p['sku'],
                'supplier'      => 'digiflazz',
                'supplier_code' => $p['supplier_code'],
                'base_price'    => $p['base_price'],
                'sell_price'    => $p['sell_price'],
                'type'          => 'token',
                'is_active'     => true,
                'stock'         => -1,
            ]);
        }
    }

    private function seedBPJS(): void
    {
        $brand = Brand::where('slug', 'bpjs')->first();
        if (!$brand) return;

        $products = [
            ['name' => 'BPJS 1 Bulan',  'sku' => 'BPJS-1M', 'base_price' => 50000, 'sell_price' => 51500, 'supplier_code' => 'BPJSKSP1'],
            ['name' => 'BPJS 2 Bulan',  'sku' => 'BPJS-2M', 'base_price' => 100000,'sell_price' => 102500,'supplier_code' => 'BPJSKSP2'],
            ['name' => 'BPJS 3 Bulan',  'sku' => 'BPJS-3M', 'base_price' => 150000,'sell_price' => 153500,'supplier_code' => 'BPJSKSP3'],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['sku' => $p['sku']], [
                'category_id'   => $brand->category_id,
                'brand_id'      => $brand->id,
                'name'          => $p['name'],
                'sku'           => $p['sku'],
                'supplier'      => 'digiflazz',
                'supplier_code' => $p['supplier_code'],
                'base_price'    => $p['base_price'],
                'sell_price'    => $p['sell_price'],
                'type'          => 'prepaid',
                'is_active'     => true,
                'stock'         => -1,
            ]);
        }
    }
}
