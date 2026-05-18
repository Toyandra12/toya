<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $brands = Brand::with('category')
            ->withCount('products')
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->orderBy('sort_order')
            ->paginate(20);

        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Brands/Index', [
            'brands'     => $brands,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'name'         => 'required|string|max:100',
            'slug'         => 'nullable|string|unique:brands,slug',
            'description'  => 'nullable|string',
            'game_code'    => 'nullable|string|max:50',
            'form_fields'  => 'nullable|array',
            'sort_order'   => 'nullable|integer',
            'is_active'    => 'boolean',
            'is_featured'  => 'boolean',
            'logo'         => 'nullable|image|max:2048',
            'banner'       => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('brands/logos', 'public');
        }
        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('brands/banners', 'public');
        }

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        Brand::create($data);

        return back()->with('success', 'Brand berhasil ditambahkan.');
    }

    public function update(Request $request, Brand $brand)
    {
        $data = $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'name'         => 'required|string|max:100',
            'slug'         => 'nullable|string|unique:brands,slug,' . $brand->id,
            'description'  => 'nullable|string',
            'game_code'    => 'nullable|string|max:50',
            'form_fields'  => 'nullable|array',
            'sort_order'   => 'nullable|integer',
            'is_active'    => 'boolean',
            'is_featured'  => 'boolean',
            'logo'         => 'nullable|image|max:2048',
            'banner'       => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('brands/logos', 'public');
        }
        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('brands/banners', 'public');
        }

        $brand->update($data);
        return back()->with('success', 'Brand berhasil diperbarui.');
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();
        return back()->with('success', 'Brand berhasil dihapus.');
    }
}
