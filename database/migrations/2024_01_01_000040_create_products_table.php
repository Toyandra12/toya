<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('sku')->unique();
            $table->text('description')->nullable();

            // Supplier config
            $table->string('supplier')->default('digiflazz'); // digiflazz, apigames, manual
            $table->string('supplier_code')->nullable();       // buyer_sku_code from Digiflazz

            // Pricing
            $table->decimal('base_price', 15, 2)->default(0);   // cost price
            $table->decimal('sell_price', 15, 2)->default(0);   // selling price
            $table->decimal('markup', 5, 2)->default(0);        // markup %

            // Product type
            $table->string('type')->default('prepaid'); // prepaid, postpaid, voucher, token

            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_flash_sale')->default(false);
            $table->decimal('flash_sale_price', 15, 2)->nullable();
            $table->timestamp('flash_sale_ends_at')->nullable();

            $table->integer('sort_order')->default(0);
            $table->integer('stock')->default(-1); // -1 = unlimited
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
