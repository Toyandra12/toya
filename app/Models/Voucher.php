<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'name', 'description', 'discount_type', 'discount_value',
        'min_transaction', 'max_discount', 'quota', 'used_count',
        'per_user_limit', 'is_active', 'starts_at', 'expires_at', 'category_id',
    ];

    protected function casts(): array
    {
        return [
            'discount_value'  => 'decimal:2',
            'min_transaction' => 'decimal:2',
            'max_discount'    => 'decimal:2',
            'is_active'       => 'boolean',
            'starts_at'       => 'datetime',
            'expires_at'      => 'datetime',
            'quota'           => 'integer',
            'used_count'      => 'integer',
            'per_user_limit'  => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function usages()
    {
        return $this->hasMany(VoucherUsage::class);
    }

    public function calculateDiscount(float $amount): float
    {
        if ($amount < $this->min_transaction) return 0;

        if ($this->discount_type === 'percent') {
            $discount = $amount * ($this->discount_value / 100);
            if ($this->max_discount) {
                $discount = min($discount, $this->max_discount);
            }
        } else {
            $discount = $this->discount_value;
        }

        return min($discount, $amount);
    }

    public function isValid(int $userId, float $amount): bool
    {
        if (!$this->is_active) return false;
        $now = now();
        if ($this->starts_at && $now->lt($this->starts_at)) return false;
        if ($this->expires_at && $now->gt($this->expires_at)) return false;
        if ($this->quota !== -1 && $this->used_count >= $this->quota) return false;
        if ($amount < $this->min_transaction) return false;

        $userUsage = $this->usages()->where('user_id', $userId)->count();
        if ($userUsage >= $this->per_user_limit) return false;

        return true;
    }
}
