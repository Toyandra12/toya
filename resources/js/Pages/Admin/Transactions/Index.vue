<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Transaksi</h1>
      </div>

      <!-- Filters -->
      <div class="card p-4 flex flex-wrap gap-3">
        <input v-model="f.search" type="text" placeholder="Invoice / Email user..." class="input flex-1 min-w-48" @keydown.enter="apply" />
        <select v-model="f.status" class="input w-40" @change="apply">
          <option value="">Semua Status</option>
          <option v-for="(label, key) in statuses" :key="key" :value="key">{{ label }}</option>
        </select>
        <select v-model="f.supplier" class="input w-36" @change="apply">
          <option value="">Supplier</option>
          <option value="digiflazz">Digiflazz</option>
          <option value="apigames">API Games</option>
          <option value="manual">Manual</option>
        </select>
        <input v-model="f.date_from" type="date" class="input w-36" @change="apply" />
        <input v-model="f.date_to" type="date" class="input w-36" @change="apply" />
        <button @click="apply" class="btn-primary">Filter</button>
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
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tujuan</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Total</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-if="!transactions.data?.length">
                <td colspan="7" class="px-4 py-12 text-center text-gray-400">Tidak ada data</td>
              </tr>
              <tr v-for="trx in transactions.data" :key="trx.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ trx.invoice_number }}</td>
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-800">{{ trx.user?.name }}</p>
                  <p class="text-xs text-gray-400">{{ trx.user?.email }}</p>
                </td>
                <td class="px-4 py-3 max-w-40 truncate text-gray-700">{{ trx.product?.name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ trx.customer_no }}</td>
                <td class="px-4 py-3 text-right font-semibold">{{ formatRupiah(trx.total_amount) }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="`badge badge-${statusColor(trx.status)}`">{{ trx.status_label }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <Link :href="route('admin.transactions.show', trx.id)" class="text-primary-600 hover:text-primary-700 text-xs font-medium">Detail</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="transactions.last_page > 1" class="px-4 py-3 border-t flex justify-between items-center">
          <p class="text-xs text-gray-500">{{ transactions.from }}-{{ transactions.to }} dari {{ transactions.total }}</p>
          <div class="flex gap-1">
            <button v-for="page in Math.min(transactions.last_page, 10)" :key="page" @click="goPage(page)"
              :class="['px-2.5 py-1 text-xs rounded transition-colors', page === transactions.current_page ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { reactive } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({ transactions: Object, filters: Object, statuses: Object });

const f = reactive({ ...props.filters });

function apply() { router.get(route('admin.transactions.index'), f, { preserveState: true, replace: true }); }
function goPage(p) { router.get(route('admin.transactions.index'), { ...f, page: p }, { preserveState: true, replace: true }); }
function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
function statusColor(s) { return { pending:'warning', paid:'info', processing:'info', success:'success', failed:'danger', cancelled:'gray', refunded:'gray' }[s] ?? 'gray'; }
</script>
