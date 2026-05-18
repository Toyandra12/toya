<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Stat Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total User" :value="stats.total_users" icon="👤" color="blue" :sub="`+${stats.new_users_today} hari ini`" />
        <StatCard title="Transaksi Hari Ini" :value="stats.transactions_today" icon="📦" color="green" :sub="`Total: ${stats.total_transactions}`" />
        <StatCard title="Pendapatan Hari Ini" :value="formatRupiah(stats.revenue_today)" icon="💰" color="yellow" :sub="'Bulan ini: ' + formatRupiah(stats.revenue_month)" />
        <StatCard title="Transaksi Pending" :value="stats.pending_transactions" icon="⏳" color="red" :sub="`Gagal: ${stats.failed_transactions}`" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2 card p-5">
          <h2 class="font-semibold text-gray-800 mb-4">Pendapatan 7 Hari Terakhir</h2>
          <div class="h-64 flex items-end gap-1">
            <div v-for="day in revenueChart" :key="day.date" class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs text-gray-500">{{ formatRupiah(day.total) }}</span>
              <div class="w-full bg-primary-500 rounded-t-sm transition-all" :style="`height: ${maxRevenue ? (day.total / maxRevenue * 200) : 0}px`"></div>
              <span class="text-xs text-gray-400 whitespace-nowrap">{{ formatDate(day.date) }}</span>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="card p-5">
          <h2 class="font-semibold text-gray-800 mb-4">Produk Terlaris (Bulan Ini)</h2>
          <div class="space-y-3">
            <div v-for="(item, i) in topProducts" :key="i" class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold flex-shrink-0">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ item.product?.name }}</p>
                <p class="text-xs text-gray-400">{{ item.count }}x · {{ formatRupiah(item.revenue) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="card">
        <div class="p-5 border-b flex items-center justify-between">
          <h2 class="font-semibold text-gray-800">Transaksi Terbaru</h2>
          <Link :href="route('admin.transactions.index')" class="text-sm text-primary-600 hover:text-primary-700">Lihat semua →</Link>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Invoice</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">User</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Produk</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Total</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="trx in recentTransactions" :key="trx.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ trx.invoice_number }}</td>
                <td class="px-4 py-3 text-gray-800">{{ trx.user?.name }}</td>
                <td class="px-4 py-3 text-gray-600 max-w-32 truncate">{{ trx.product?.name }}</td>
                <td class="px-4 py-3 text-right font-medium text-gray-900">{{ formatRupiah(trx.total_amount) }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="`badge badge-${statusColor(trx.status)}`">{{ trx.status_label }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({ stats: Object, revenueChart: Array, recentTransactions: Array, topProducts: Array });

const maxRevenue = computed(() => Math.max(...(props.revenueChart?.map(d => d.total) ?? [1])));

const StatCard = {
  props: ['title','value','icon','color','sub'],
  template: `
    <div class="card p-5">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">{{ title }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</p>
          <p v-if="sub" class="text-xs text-gray-400 mt-1">{{ sub }}</p>
        </div>
        <span class="text-2xl">{{ icon }}</span>
      </div>
    </div>
  `,
};

function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
function formatDate(d) { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }); }
function statusColor(s) { return { pending:'warning', paid:'info', processing:'info', success:'success', failed:'danger', cancelled:'gray' }[s] ?? 'gray'; }
</script>
