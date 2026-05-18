<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\DigiflazzService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function __construct(private DigiflazzService $digiflazz) {}

    public function index(Request $request)
    {
        $products = Product::with(['brand', 'category'])
            ->when($request->brand_id, fn($q) => $q->where('brand_id', $request->brand_id))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy('sort_order')
            ->paginate(25);

        $categories = Category::where('is_active', true)->get(['id', 'name']);
        $brands     = Brand::where('is_active', true)->get(['id', 'name', 'category_id']);

        return Inertia::render('Admin/Products/Index', [
            'products'   => $products,
            'categories' => $categories,
            'brands'     => $brands,
            'filters'    => $request->only('brand_id', 'category_id', 'search'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id'       => 'required|exists:categories,id',
            'brand_id'          => 'required|exists:brands,id',
            'name'              => 'required|string|max:200',
            'sku'               => 'required|string|unique:products,sku',
            'description'       => 'nullable|string',
            'supplier'          => 'required|in:digiflazz,apigames,manual',
            'supplier_code'     => 'nullable|string',
            'base_price'        => 'required|numeric|min:0',
            'sell_price'        => 'required|numeric|min:0',
            'markup'            => 'nullable|numeric|min:0',
            'type'              => 'required|in:prepaid,postpaid,voucher,token',
            'is_active'         => 'boolean',
            'is_featured'       => 'boolean',
            'is_flash_sale'     => 'boolean',
            'flash_sale_price'  => 'nullable|numeric|min:0',
            'flash_sale_ends_at'=> 'nullable|date',
            'sort_order'        => 'nullable|integer',
            'stock'             => 'nullable|integer|min:-1',
        ]);

        Product::create($data);
        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'category_id'       => 'required|exists:categories,id',
            'brand_id'          => 'required|exists:brands,id',
            'name'              => 'required|string|max:200',
            'sku'               => 'required|string|unique:products,sku,' . $product->id,
            'description'       => 'nullable|string',
            'supplier'          => 'required|in:digiflazz,apigames,manual',
            'supplier_code'     => 'nullable|string',
            'base_price'        => 'required|numeric|min:0',
            'sell_price'        => 'required|numeric|min:0',
            'markup'            => 'nullable|numeric|min:0',
            'type'              => 'required|in:prepaid,postpaid,voucher,token',
            'is_active'         => 'boolean',
            'is_featured'       => 'boolean',
            'is_flash_sale'     => 'boolean',
            'flash_sale_price'  => 'nullable|numeric|min:0',
            'flash_sale_ends_at'=> 'nullable|date',
            'sort_order'        => 'nullable|integer',
            'stock'             => 'nullable|integer|min:-1',
        ]);

        $product->update($data);
        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return back()->with('success', 'Produk berhasil dihapus.');
    }

    /**
     * Import products from Digiflazz price list
     */
    public function importFromDigiflazz(Request $request)
    {
        $request->validate(['brand_id' => 'required|exists:brands,id']);

        $brand    = Brand::findOrFail($request->brand_id);
        $priceList = $this->digiflazz->getPriceList();

        $imported = 0;
        foreach ($priceList as $item) {
            $sku = 'DGF-' . ($item['buyer_sku_code'] ?? uniqid());
            Product::updateOrCreate(
                ['sku' => $sku],
                [
                    'category_id'   => $brand->category_id,
                    'brand_id'      => $brand->id,
                    'name'          => $item['product_name'] ?? $item['buyer_sku_code'],
                    'supplier'      => 'digiflazz',
                    'supplier_code' => $item['buyer_sku_code'],
                    'base_price'    => $item['price'] ?? 0,
                    'sell_price'    => ($item['price'] ?? 0) * (1 + config('toya.default_markup') / 100),
                    'type'          => ($item['type'] ?? 'Prepaid') === 'Postpaid' ? 'postpaid' : 'prepaid',
                    'is_active'     => ($item['buyer_product_status'] ?? true) && ($item['seller_product_status'] ?? true),
                ]
            );
            $imported++;
        }

        return back()->with('success', "Berhasil import {$imported} produk dari Digiflazz.");
    }
}
