<template>
  <AdminLayout>
    <div class="space-y-5">
      <h1 class="text-xl font-bold text-gray-900">Laporan Pendapatan {{ year }}</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card p-5">
          <h2 class="font-semibold text-gray-800 mb-4">Bulanan</h2>
          <div class="space-y-3">
            <div v-for="m in monthly" :key="m.month" class="flex items-center gap-3">
              <span class="text-xs text-gray-500 w-12">Bln {{ m.month }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div class="h-5 bg-primary-500 rounded-full" :style="`width: ${maxRev ? (m.revenue / maxRev * 100) : 0}%`"></div>
              </div>
              <span class="text-xs w-28 text-right font-medium text-gray-700">{{ formatRupiah(m.revenue) }}</span>
            </div>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="font-semibold text-gray-800 mb-4">Per Kategori</h2>
          <div class="space-y-3">
            <div v-for="c in byCategory" :key="c.category" class="flex items-center gap-3">
              <span class="text-xs text-gray-500 w-28 flex-shrink-0 truncate">{{ c.category }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div class="h-5 bg-secondary-500 rounded-full" :style="`width: ${maxCat ? (c.revenue / maxCat * 100) : 0}%`"></div>
              </div>
              <span class="text-xs w-24 text-right font-medium text-gray-700">{{ formatRupiah(c.revenue) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed } from 'vue';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({ monthly: Array, byCategory: Array, year: Number });

const maxRev = computed(() => Math.max(...(props.monthly?.map(m => m.revenue) ?? [1])));
const maxCat = computed(() => Math.max(...(props.byCategory?.map(c => c.revenue) ?? [1])));

function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
</script>
