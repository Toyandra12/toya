<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SaldoTopup extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_number', 'user_id', 'amount',
        'payment_method', 'payment_status', 'payment_channel',
        'midtrans_order_id', 'midtrans_transaction_id',
        'midtrans_snap_token', 'midtrans_snap_url',
        'status', 'note', 'approved_by', 'approved_at', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount'      => 'decimal:2',
            'approved_at' => 'datetime',
            'paid_at'     => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public static function generateInvoice(): string
    {
        $date = now()->format('Ymd');
        $rand = strtoupper(substr(uniqid(), -6));
        return "SALDO-{$date}-{$rand}";
    }
}
