<script setup>
/**
 * BrandGrid — featured brands. Each tile composes AppCard + image fallback.
 */
import { Link } from '@inertiajs/vue3'
import AppLink from '@/Components/UI/AppLink.vue'

defineProps({
    brands:  { type: Array,  default: () => [] },
    title:   { type: String, default: 'Brand Populer' },
    seeAll:  { type: String, default: null },
})
</script>

<template>
    <section aria-labelledby="brands-heading">
        <header class="flex items-end justify-between mb-4">
            <h2 id="brands-heading" class="text-3xl font-semibold">{{ title }}</h2>
            <AppLink v-if="seeAll" :href="seeAll" variant="standalone" class="text-sm">
                Lihat semua →
            </AppLink>
        </header>

        <ul
            v-if="brands.length"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
            role="list"
        >
            <li v-for="brand in brands" :key="brand.id">
                <Link
                    :href="`/kategori/${brand.category?.slug || 'game'}/${brand.slug}`"
                    class="block aspect-square overflow-hidden rounded-md bg-surface-raised shadow-t4 hover:shadow-t1 hover:-translate-y-0.5 transition duration-base ease-base focus-visible:shadow-focus relative group"
                >
                    <img
                        v-if="brand.logo"
                        :src="`/storage/${brand.logo}`"
                        :alt="brand.name"
                        class="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                    />
                    <div
                        v-else
                        class="absolute inset-0 flex items-center justify-center bg-surface-muted text-fg-inverse text-3xl"
                        aria-hidden="true"
                    >{{ brand.name?.[0]?.toUpperCase() || '?' }}</div>
                    <div
                        class="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                    >
                        <p class="text-sm font-semibold text-fg-primary truncate" :title="brand.name">
                            {{ brand.name }}
                        </p>
                    </div>
                </Link>
            </li>
        </ul>

        <p v-else class="text-fg-inverse text-sm">Brand belum tersedia.</p>
    </section>
</template>
