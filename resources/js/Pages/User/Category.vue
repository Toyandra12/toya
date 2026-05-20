<script setup>
/**
 * Category — list all brands within a category.
 * Composes BrandGrid (data-list, ≤4 lists per UI guideline §4.4).
 */
import { Head, Link } from '@inertiajs/vue3'

import Breadcrumbs from '@/Components/Storefront/Breadcrumbs.vue'
import BrandGrid   from '@/Components/Storefront/BrandGrid.vue'
import EmptyState  from '@/Components/UI/EmptyState.vue'
import AppButton   from '@/Components/UI/AppButton.vue'

defineProps({
    category: { type: Object, required: true },
    brands:   { type: Array,  default: () => [] },
})
</script>

<template>
    <Head :title="category.name" />

    <div class="site-container py-6 flex flex-col gap-6">
        <Breadcrumbs
            :items="[
                { label: 'Beranda', href: '/' },
                { label: category.name },
            ]"
        />

        <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
                <h1 class="text-3xl md:text-4xl font-semibold mb-t5">{{ category.name }}</h1>
                <p v-if="category.description" class="text-md text-fg-inverse max-w-2xl">
                    {{ category.description }}
                </p>
            </div>
            <p class="text-sm text-fg-inverse" aria-live="polite">
                {{ brands.length }} brand tersedia
            </p>
        </header>

        <BrandGrid
            v-if="brands.length"
            :brands="brands.map(b => ({ ...b, category }))"
            title="Pilih brand"
        />

        <EmptyState
            v-else
            title="Belum ada brand di kategori ini"
            description="Kategori ini belum memiliki brand aktif. Coba kategori lain atau lihat semua produk."
        >
            <AppButton href="/" variant="primary">Kembali ke beranda</AppButton>
        </EmptyState>
    </div>
</template>
