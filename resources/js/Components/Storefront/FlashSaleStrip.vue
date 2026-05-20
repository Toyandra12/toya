<script setup>
/**
 * FlashSaleStrip — horizontal-scrolling product cards.
 * Each card uses AppCard + Badge primitive; price uses .text-token-price.
 * Empty state hides the strip entirely (caller decides via v-if).
 */
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import Badge from '@/Components/UI/Badge.vue'
import { formatRupiah } from '@/composables/useFormat.js'

const props = defineProps({
    products: { type: Array, default: () => [] },
})

const items = computed(() => props.products)
</script>

<template>
    <section v-if="items.length" aria-labelledby="flash-heading">
        <header class="flex items-end justify-between mb-4">
            <div class="flex items-center gap-t7">
                <h2 id="flash-heading" class="text-3xl font-semibold">Flash Sale</h2>
                <Badge tone="brand">HEMAT</Badge>
            </div>
            <p class="text-sm text-fg-inverse hidden md:block">Berlaku terbatas</p>
        </header>

        <ul
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            role="list"
        >
            <li v-for="product in items" :key="product.id">
                <Link
                    :href="`/checkout/${product.id}`"
                    class="block bg-surface-raised rounded-md shadow-t4 hover:shadow-t1 hover:-translate-y-0.5 transition duration-base ease-base focus-visible:shadow-focus overflow-hidden p-4"
                >
                    <div class="flex items-center justify-between mb-3">
                        <Badge tone="warn">{{ product.brand?.name || 'Promo' }}</Badge>
                        <span class="text-xs text-fg-inverse">{{ product.category?.name }}</span>
                    </div>

                    <h3 class="text-lg font-semibold text-fg-primary mb-3 line-clamp-2" :title="product.name">
                        {{ product.name }}
                    </h3>

                    <div class="flex items-baseline gap-t7 flex-wrap">
                        <span class="text-token-price">
                            {{ formatRupiah(product.flash_sale_price ?? product.sell_price) }}
                        </span>
                        <span
                            v-if="product.flash_sale_price && product.flash_sale_price < product.sell_price"
                            class="text-sm text-fg-inverse line-through"
                        >
                            {{ formatRupiah(product.sell_price) }}
                        </span>
                    </div>
                </Link>
            </li>
        </ul>
    </section>
</template>
