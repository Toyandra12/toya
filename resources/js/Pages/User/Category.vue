<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" class="hover:text-primary-600">Beranda</Link>
        <span>/</span>
        <span class="text-gray-800 font-medium">{{ category.name }}</span>
      </nav>

      <div class="flex items-center gap-3 mb-6">
        <span class="text-3xl">{{ category.icon }}</span>
        <h1 class="text-2xl font-bold text-gray-900">{{ category.name }}</h1>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Link v-for="brand in brands" :key="brand.id"
          :href="`/kategori/${category.slug}/${brand.slug}`"
          class="card p-4 flex flex-col items-center text-center hover:shadow-md hover:border-primary-200 transition-all group">
          <div class="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-2xl font-bold text-primary-700 mb-3 group-hover:bg-primary-100 transition-colors">
            {{ brand.name.charAt(0) }}
          </div>
          <p class="text-sm font-semibold text-gray-800 group-hover:text-primary-700 leading-tight">{{ brand.name }}</p>
        </Link>
      </div>

      <div v-if="!brands.length" class="text-center py-20">
        <p class="text-4xl mb-3">🔍</p>
        <p class="text-gray-500">Belum ada brand dalam kategori ini</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';

defineProps({ category: Object, brands: Array });
</script>
