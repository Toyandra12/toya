<script setup>
/**
 * CategoryGrid — top-level browse entry. Each tile is one focusable Card link.
 */
import { Link } from '@inertiajs/vue3'

defineProps({
    categories: { type: Array, default: () => [] },
})

const ICON_MAP = {
    game: '🎮',
    pulsa: '📱',
    'paket-data': '📶',
    ppob: '⚡',
    voucher: '🎟️',
    emoney: '💳',
}
</script>

<template>
    <section aria-labelledby="categories-heading">
        <header class="flex items-end justify-between mb-4">
            <h2 id="categories-heading" class="text-3xl font-semibold">Kategori</h2>
            <p class="text-sm text-fg-inverse hidden md:block">Pilih kategori untuk mulai belanja</p>
        </header>

        <ul
            v-if="categories.length"
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
            role="list"
        >
            <li v-for="cat in categories" :key="cat.id">
                <Link
                    :href="`/kategori/${cat.slug}`"
                    class="group flex flex-col items-center justify-center text-center p-4 rounded-md bg-surface-raised hover:bg-surface-muted transition duration-base ease-base focus-visible:shadow-focus min-h-[112px]"
                >
                    <span
                        class="inline-flex h-12 w-12 items-center justify-center rounded-md bg-surface-muted group-hover:bg-fg-tertiary text-2xl mb-t7 transition-colors duration-base"
                        aria-hidden="true"
                    >{{ ICON_MAP[cat.slug] || '🛒' }}</span>
                    <span class="text-md font-medium text-fg-primary">{{ cat.name }}</span>
                </Link>
            </li>
        </ul>

        <p v-else class="text-fg-inverse text-sm">Belum ada kategori tersedia.</p>
    </section>
</template>
