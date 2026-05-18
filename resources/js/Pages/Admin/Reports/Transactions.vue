<template>
  <AdminLayout>
    <div class="space-y-5">
      <h1 class="text-xl font-bold text-gray-900">Laporan Transaksi</h1>

      <div class="card p-4 flex flex-wrap gap-3">
        <input v-model="f.date_from" type="date" class="input w-40" @change="apply" />
        <input v-model="f.date_to" type="date" class="input w-40" @change="apply" />
        <select v-model="f.status" class="input w-36" @change="apply">
          <option value="">Semua Status</option>
          <option value="success">Berhasil</option>
          <option value="failed">Gagal</option>
          <option value="pending">Pending</option>
        </select>
        <button @click="apply" class="btn-primary">Filter</button>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-gray-900">{{ summary.total }}</p>
          <p class="text-xs text-gray-500 mt-1">Total Transaksi</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-lg font-bold text-green-600">{{ formatRupiah(summary.total_revenue) }}</p>
          <p class="text-xs text-gray-500 mt-1">Total Pendapatan</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ summary.success }}</p>
          <p class="text-xs text-gray-500 mt-1">Berhasil</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-red-500">{{ summary.failed }}</p>
          <p class="text-xs text-gray-500 mt-1">Gagal</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-yellow-500">{{ summary.pending }}</p>
          <p class="text-xs text-gray-500 mt-1">Pending</p>
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Invoice</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">User</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Produk</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Total</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Tanggal</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="t in transactions.data" :key="t.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ t.invoice_number }}</td>
                <td class="px-4 py-3 text-gray-700">{{ t.user?.name }}</td>
                <td class="px-4 py-3 text-gray-600 max-w-32 truncate">{{ t.product?.name }}</td>
                <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ formatRupiah(t.total_amount) }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="`badge badge-${statusColor(t.status)}`">{{ t.status }}</span>
                </td>
                <td class="px-4 py-3 text-center text-xs text-gray-400">{{ new Date(t.created_at).toLocaleDateString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { reactive } from 'vue';
import { router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({ transactions: Object, summary: Object, filters: Object });
const f = reactive({ date_from: props.filters?.date_from ?? '', date_to: props.filters?.date_to ?? '', status: props.filters?.status ?? '' });

function apply() { router.get(route('admin.reports.transactions'), f, { preserveState: true, replace: true }); }
function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
function statusColor(s) { return { success: 'success', failed: 'danger', pending: 'warning' }[s] ?? 'gray'; }
</script>
