<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-xl font-bold text-gray-900 mb-6">Riwayat Transaksi</h1>

      <!-- Filters -->
      <div class="card p-4 mb-5 flex flex-wrap gap-3">
        <input v-model="filters.search" type="text" placeholder="Cari nomor invoice..." class="input flex-1 min-w-48" @keydown.enter="applyFilters" />
        <select v-model="filters.status" class="input w-48" @change="applyFilters">
          <option value="">Semua Status</option>
          <option v-for="(label, key) in statuses" :key="key" :value="key">{{ label }}</option>
        </select>
        <button @click="applyFilters" class="btn-primary">Cari</button>
      </div>

      <!-- List -->
      <div class="space-y-3">
        <div v-if="!transactions.data?.length" class="card p-12 text-center">
          <p class="text-4xl mb-3">📭</p>
          <p class="text-gray-500">Belum ada transaksi</p>
        </div>
        <Link v-for="trx in transactions.data" :key="trx.id" :href="`/transaksi/${trx.invoice_number}`"
          class="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-xl flex-shrink-0">
            {{ trx.product?.category?.icon || '🛒' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 truncate">{{ trx.product?.name }}</p>
            <p class="text-xs text-gray-500">{{ trx.invoice_number }} · {{ trx.product?.brand?.name }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="font-bold text-gray-900">{{ formatRupiah(trx.total_amount) }}</p>
            <span :class="`badge badge-${trx.status_color} text-xs mt-1`">{{ trx.status_label }}</span>
          </div>
        </Link>
      </div>

      <!-- Pagination -->
      <div v-if="transactions.last_page > 1" class="mt-6 flex justify-center gap-2">
        <button v-for="page in transactions.last_page" :key="page"
          @click="goPage(page)"
          :class="['px-3 py-1.5 text-sm rounded-lg transition-colors', page === transactions.current_page ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border']">
          {{ page }}
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { reactive } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({ transactions: Object, filters: Object });

const filters = reactive({
  search: props.filters?.search ?? '',
  status: props.filters?.status ?? '',
});

const statuses = {
  pending: 'Menunggu Pembayaran',
  paid: 'Dibayar',
  processing: 'Diproses',
  success: 'Berhasil',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
};

function applyFilters() {
  router.get('/transaksi', filters, { preserveState: true, replace: true });
}

function goPage(page) {
  router.get('/transaksi', { ...filters, page }, { preserveState: true, replace: true });
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}
</script>
