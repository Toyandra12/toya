<template>
  <AdminLayout>
    <div class="space-y-6">
      <h1 class="text-xl font-bold text-gray-900">Analitik</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Monthly Revenue -->
        <div class="card p-5">
          <h2 class="font-semibold text-gray-800 mb-4">Pendapatan 6 Bulan Terakhir</h2>
          <div class="space-y-3">
            <div v-for="m in monthlyChart" :key="m.label" class="flex items-center gap-3">
              <span class="text-xs text-gray-500 w-20 flex-shrink-0">{{ m.label }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div class="h-4 bg-primary-500 rounded-full transition-all" :style="`width: ${maxRevenue ? (m.revenue / maxRevenue * 100) : 0}%`"></div>
              </div>
              <span class="text-xs font-medium text-gray-700 w-24 text-right">{{ formatRupiah(m.revenue) }}</span>
            </div>
          </div>
        </div>

        <!-- Category Revenue -->
        <div class="card p-5">
          <h2 class="font-semibold text-gray-800 mb-4">Pendapatan per Kategori (Bulan Ini)</h2>
          <div class="space-y-3">
            <div v-for="cat in categoryRevenue" :key="cat.category" class="flex items-center gap-3">
              <span class="text-xs text-gray-500 w-28 flex-shrink-0 truncate">{{ cat.category }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div class="h-4 bg-secondary-500 rounded-full" :style="`width: ${maxCatRevenue ? (cat.revenue / maxCatRevenue * 100) : 0}%`"></div>
              </div>
              <span class="text-xs font-medium text-gray-700 w-24 text-right">{{ formatRupiah(cat.revenue) }}</span>
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

const props = defineProps({ monthlyChart: Array, categoryRevenue: Array });

const maxRevenue    = computed(() => Math.max(...(props.monthlyChart?.map(m => m.revenue) ?? [1])));
const maxCatRevenue = computed(() => Math.max(...(props.categoryRevenue?.map(c => c.revenue) ?? [1])));

function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
</script>
