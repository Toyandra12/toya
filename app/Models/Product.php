<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id', 'brand_id', 'name', 'sku', 'description',
        'supplier', 'supplier_code',
        'base_price', 'sell_price', 'markup', 'type',
        'is_active', 'is_featured', 'is_flash_sale',
        'flash_sale_price', 'flash_sale_ends_at',
        'sort_order', 'stock',
    ];

    protected function casts(): array
    {
        return [
            'base_price'         => 'decimal:2',
            'sell_price'         => 'decimal:2',
            'markup'             => 'decimal:2',
            'flash_sale_price'   => 'decimal:2',
            'flash_sale_ends_at' => 'datetime',
            'is_active'          => 'boolean',
            'is_featured'        => 'boolean',
            'is_flash_sale'      => 'boolean',
            'sort_order'         => 'integer',
            'stock'              => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getEffectivePriceAttribute(): float
    {
        if ($this->is_flash_sale && $this->flash_sale_price &&
            $this->flash_sale_ends_at && $this->flash_sale_ends_at->isFuture()) {
            return (float) $this->flash_sale_price;
        }
        return (float) $this->sell_price;
    }

    public function getIsAvailableAttribute(): bool
    {
        return $this->is_active && ($this->stock === -1 || $this->stock > 0);
    }
}
