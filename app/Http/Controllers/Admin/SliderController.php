<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SliderController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sliders/Index', [
            'sliders' => Slider::orderBy('sort_order')->paginate(20),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:200',
            'subtitle'     => 'nullable|string|max:300',
            'link'         => 'nullable|url',
            'button_text'  => 'nullable|string|max:50',
            'badge'        => 'nullable|string|max:50',
            'badge_color'  => 'nullable|string|max:20',
            'sort_order'   => 'nullable|integer',
            'is_active'    => 'boolean',
            'starts_at'    => 'nullable|date',
            'ends_at'      => 'nullable|date|after:starts_at',
            'image'        => 'required|image|max:5120',
            'mobile_image' => 'nullable|image|max:2048',
        ]);

        $data['image'] = $request->file('image')->store('sliders', 'public');
        if ($request->hasFile('mobile_image')) {
            $data['mobile_image'] = $request->file('mobile_image')->store('sliders', 'public');
        }

        Slider::create($data);
        return back()->with('success', 'Slider berhasil ditambahkan.');
    }

    public function update(Request $request, Slider $slider)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:200',
            'subtitle'     => 'nullable|string|max:300',
            'link'         => 'nullable|url',
            'button_text'  => 'nullable|string|max:50',
            'badge'        => 'nullable|string|max:50',
            'badge_color'  => 'nullable|string|max:20',
            'sort_order'   => 'nullable|integer',
            'is_active'    => 'boolean',
            'starts_at'    => 'nullable|date',
            'ends_at'      => 'nullable|date|after:starts_at',
            'image'        => 'nullable|image|max:5120',
            'mobile_image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('sliders', 'public');
        }
        if ($request->hasFile('mobile_image')) {
            $data['mobile_image'] = $request->file('mobile_image')->store('sliders', 'public');
        }

        $slider->update($data);
        return back()->with('success', 'Slider berhasil diperbarui.');
    }

    public function destroy(Slider $slider)
    {
        $slider->delete();
        return back()->with('success', 'Slider berhasil dihapus.');
    }
}
