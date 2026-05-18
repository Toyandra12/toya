<template>
  <Link :href="`/checkout/${product.id}`"
    class="card p-3 flex flex-col hover:shadow-md hover:border-primary-200 transition-all group">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-gray-400">{{ product.brand?.name }}</span>
      <span v-if="product.is_flash_sale" class="badge badge-danger text-xs">FLASH</span>
    </div>
    <p class="text-sm font-semibold text-gray-800 group-hover:text-primary-700 leading-tight mb-2">{{ product.name }}</p>
    <div class="mt-auto">
      <div v-if="product.is_flash_sale && product.flash_sale_price" class="flex items-center gap-1">
        <span class="text-xs line-through text-gray-400">{{ formatRupiah(product.sell_price) }}</span>
      </div>
      <span class="text-base font-bold text-primary-600">
        {{ formatRupiah(product.is_flash_sale && product.flash_sale_price ? product.flash_sale_price : product.sell_price) }}
      </span>
    </div>
  </Link>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({ product: Object });

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}
</script>
