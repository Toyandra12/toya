<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Faq;
use App\Models\Slider;
use App\Models\Product;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $sliders = Slider::where('is_active', true)
            ->where(fn($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->orderBy('sort_order')
            ->get();

        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $featuredBrands = Brand::where('is_active', true)
            ->where('is_featured', true)
            ->with('category')
            ->orderBy('sort_order')
            ->limit(12)
            ->get();

        $flashSaleProducts = Product::where('is_active', true)
            ->where('is_flash_sale', true)
            ->where('flash_sale_ends_at', '>', now())
            ->with(['brand', 'category'])
            ->orderBy('sort_order')
            ->limit(8)
            ->get();

        $faqs = Faq::where('is_active', true)
            ->orderBy('sort_order')
            ->limit(8)
            ->get();

        return Inertia::render('User/Home', [
            'sliders'           => $sliders,
            'categories'        => $categories,
            'featuredBrands'    => $featuredBrands,
            'flashSaleProducts' => $flashSaleProducts,
            'faqs'              => $faqs,
        ]);
    }

    public function category(string $slug)
    {
        $category = Category::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $brands   = Brand::where('category_id', $category->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('User/Category', [
            'category' => $category,
            'brands'   => $brands,
        ]);
    }

    public function brand(string $categorySlug, string $brandSlug)
    {
        $category = Category::where('slug', $categorySlug)->where('is_active', true)->firstOrFail();
        $brand    = Brand::where('slug', $brandSlug)
            ->where('category_id', $category->id)
            ->where('is_active', true)
            ->firstOrFail();

        $products = Product::where('brand_id', $brand->id)
            ->where('is_active', true)
            ->orderBy('sell_price')
            ->get();

        return Inertia::render('User/Brand', [
            'category' => $category,
            'brand'    => $brand,
            'products' => $products,
        ]);
    }
}
