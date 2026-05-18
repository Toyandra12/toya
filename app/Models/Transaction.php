<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_number', 'user_id', 'product_id',
        'customer_no', 'customer_data', 'customer_name',
        'is_gift', 'gift_recipient_contact', 'gift_message', 'gift_recipient_user_id',
        'sell_price', 'admin_fee', 'discount', 'total_amount',
        'payment_method', 'payment_status', 'payment_channel',
        'midtrans_order_id', 'midtrans_transaction_id', 'midtrans_snap_token', 'midtrans_snap_url',
        'paid_at',
        'status', 'supplier', 'supplier_ref', 'supplier_trx_id', 'supplier_message', 'sn',
        'processed_at', 'admin_note', 'processed_by',
    ];

    protected function casts(): array
    {
        return [
            'customer_data'  => 'array',
            'is_gift'        => 'boolean',
            'sell_price'     => 'decimal:2',
            'admin_fee'      => 'decimal:2',
            'discount'       => 'decimal:2',
            'total_amount'   => 'decimal:2',
            'paid_at'        => 'datetime',
            'processed_at'   => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function giftRecipient()
    {
        return $this->belongsTo(User::class, 'gift_recipient_user_id');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function getStatusLabelAttribute(): string
    {
        $labels = config('toya.transaction_statuses', []);
        return $labels[$this->status] ?? ucfirst($this->status);
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending'    => 'yellow',
            'paid'       => 'blue',
            'processing' => 'indigo',
            'success'    => 'green',
            'failed'     => 'red',
            'refunded'   => 'purple',
            'cancelled'  => 'gray',
            default      => 'gray',
        };
    }

    public static function generateInvoice(): string
    {
        $date = now()->format('Ymd');
        $rand = strtoupper(substr(uniqid(), -6));
        return "TRX-{$date}-{$rand}";
    }
}
