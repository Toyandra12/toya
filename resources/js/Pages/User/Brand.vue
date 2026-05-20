<script setup>
/**
 * Brand — product nominal selection page.
 * Each product is a tappable card linking to /checkout/{id}.
 * Out-of-stock or inactive products render the disabled card state.
 */
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'

import Breadcrumbs from '@/Components/Storefront/Breadcrumbs.vue'
import EmptyState  from '@/Components/UI/EmptyState.vue'
import Badge       from '@/Components/UI/Badge.vue'
import AppButton   from '@/Components/UI/AppButton.vue'
import { formatRupiah } from '@/composables/useFormat.js'

const props = defineProps({
    category: { type: Object, required: true },
    brand:    { type: Object, required: true },
    products: { type: Array,  default: () => [] },
})

const available = computed(() =>
    props.products.filter(p => p.is_active && (p.stock === -1 || p.stock > 0))
)
const unavailable = computed(() =>
    props.products.filter(p => !p.is_active || (p.stock !== -1 && p.stock <= 0))
)

function effectivePrice(p) {
    if (
        p.is_flash_sale &&
        p.flash_sale_price &&
        p.flash_sale_ends_at &&
        new Date(p.flash_sale_ends_at) > new Date()
    ) {
        return Number(p.flash_sale_price)
    }
    return Number(p.sell_price)
}

function isOnSale(p) {
    return effectivePrice(p) < Number(p.sell_price)
}
</script>

<template>
    <Head :title="`${brand.name} — ${category.name}`" />

    <div class="site-container py-6 flex flex-col gap-6">
        <Breadcrumbs
            :items="[
                { label: 'Beranda', href: '/' },
                { label: category.name, href: `/kategori/${category.slug}` },
                { label: brand.name },
            ]"
        />

        <!-- Brand hero -->
        <header class="flex items-center gap-4 p-4 rounded-md bg-surface-raised shadow-t4">
            <div class="shrink-0">
                <img
                    v-if="brand.logo"
                    :src="`/storage/${brand.logo}`"
                    :alt="brand.name"
                    class="h-16 w-16 md:h-20 md:w-20 rounded-md object-cover"
                />
                <div
                    v-else
                    class="h-16 w-16 md:h-20 md:w-20 rounded-md bg-surface-muted flex items-center justify-center text-fg-inverse text-3xl"
                    aria-hidden="true"
                >{{ brand.name?.[0]?.toUpperCase() }}</div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-xs text-fg-inverse uppercase tracking-wide">{{ category.name }}</p>
                <h1 class="text-2xl md:text-3xl font-semibold text-fg-primary truncate" :title="brand.name">
                    {{ brand.name }}
                </h1>
                <p v-if="brand.description" class="text-sm text-fg-inverse mt-t5 line-clamp-2">
                    {{ brand.description }}
                </p>
            </div>
        </header>

        <!-- Available products -->
        <section v-if="available.length" aria-labelledby="available-heading">
            <header class="flex items-end justify-between mb-4">
                <h2 id="available-heading" class="text-2xl font-semibold">Pilih Nominal</h2>
                <p class="text-sm text-fg-inverse" aria-live="polite">
                    {{ available.length }} produk tersedia
                </p>
            </header>

            <ul
                class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                role="list"
            >
                <li v-for="product in available" :key="product.id">
                    <Link
                        :href="`/checkout/${product.id}`"
                        class="block h-full p-4 rounded-md bg-surface-raised shadow-t4 hover:shadow-t1 hover:-translate-y-0.5 transition duration-base ease-base focus-visible:shadow-focus"
                    >
                        <div class="flex items-start justify-between gap-t5 mb-3 min-h-[28px]">
                            <Badge v-if="isOnSale(product)" tone="brand">HEMAT</Badge>
                            <Badge v-else-if="product.is_featured" tone="warn">POPULER</Badge>
                            <span v-else aria-hidden="true" />
                            <span class="text-xs text-fg-inverse">{{ product.sku || '' }}</span>
                        </div>

                        <h3 class="text-md font-medium text-fg-primary mb-3 line-clamp-2" :title="product.name">
                            {{ product.name }}
                        </h3>

                        <div class="flex items-baseline gap-t5 flex-wrap">
                            <span class="text-token-price">{{ formatRupiah(effectivePrice(product)) }}</span>
                            <span
                                v-if="isOnSale(product)"
                                class="text-xs text-fg-inverse line-through"
                            >
                                {{ formatRupiah(product.sell_price) }}
                            </span>
                        </div>
                    </Link>
                </li>
            </ul>
        </section>

        <!-- Unavailable products (disabled card state) -->
        <section v-if="unavailable.length" aria-labelledby="unavailable-heading">
            <h2 id="unavailable-heading" class="text-lg font-semibold mb-3 text-fg-inverse">
                Sementara tidak tersedia
            </h2>
            <ul
                class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                role="list"
            >
                <li v-for="product in unavailable" :key="product.id">
                    <div
                        class="block h-full p-4 rounded-md bg-surface-raised shadow-t4 opacity-60"
                        :aria-disabled="true"
                    >
                        <Badge tone="neutral">Habis</Badge>
                        <h3 class="text-md font-medium text-fg-primary mt-3 mb-3 line-clamp-2">
                            {{ product.name }}
                        </h3>
                        <span class="text-token-price">{{ formatRupiah(effectivePrice(product)) }}</span>
                        <p class="mt-3 text-xs text-fg-inverse">Beri tahu saya saat tersedia.</p>
                    </div>
                </li>
            </ul>
        </section>

        <EmptyState
            v-if="!available.length && !unavailable.length"
            title="Belum ada produk untuk brand ini"
            description="Kami sedang menambahkan stok. Coba lagi nanti atau jelajahi brand lain."
        >
            <AppButton :href="`/kategori/${category.slug}`" variant="primary">
                Brand lain di {{ category.name }}
            </AppButton>
        </EmptyState>
    </div>
</template>
