<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();  // TRX-YYYYMMDD-XXXXXX
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();

            // Target/destination info
            $table->string('customer_no');               // phone, game uid, token number, etc.
            $table->json('customer_data')->nullable();   // extra data like zone_id, server_id
            $table->string('customer_name')->nullable(); // name resolved from inquiry

            // Gift flow
            $table->boolean('is_gift')->default(false);
            $table->string('gift_recipient_contact')->nullable(); // email or phone of recipient
            $table->string('gift_message')->nullable();
            $table->foreignId('gift_recipient_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Pricing
            $table->decimal('sell_price', 15, 2);
            $table->decimal('admin_fee', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);

            // Payment
            $table->string('payment_method')->default('midtrans'); // midtrans, saldo, manual
            $table->string('payment_status')->default('pending');  // pending, paid, failed
            $table->string('payment_channel')->nullable();          // bank_transfer, gopay, etc.
            $table->string('midtrans_order_id')->nullable();
            $table->string('midtrans_transaction_id')->nullable();
            $table->string('midtrans_snap_token')->nullable();
            $table->string('midtrans_snap_url')->nullable();
            $table->timestamp('paid_at')->nullable();

            // Fulfillment status
            $table->string('status')->default('pending'); // pending, paid, processing, success, failed, refunded, cancelled
            $table->string('supplier')->nullable();       // digiflazz, apigames, manual
            $table->string('supplier_ref')->nullable();   // ref_id sent to supplier
            $table->string('supplier_trx_id')->nullable();// transaction id from supplier
            $table->text('supplier_message')->nullable(); // message from supplier
            $table->text('sn')->nullable();               // serial number / token
            $table->timestamp('processed_at')->nullable();

            // Admin notes
            $table->text('admin_note')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'payment_status']);
            $table->index('invoice_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
