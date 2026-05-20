<script setup>
/**
 * Home — storefront landing.
 * Section order: Hero → Categories → Featured Brands → Flash Sale → FAQ.
 * Each region has a heading id linked via aria-labelledby for A11Y-13.
 */
import { Head } from '@inertiajs/vue3'

import HeroSlider     from '@/Components/Storefront/HeroSlider.vue'
import CategoryGrid   from '@/Components/Storefront/CategoryGrid.vue'
import BrandGrid      from '@/Components/Storefront/BrandGrid.vue'
import FlashSaleStrip from '@/Components/Storefront/FlashSaleStrip.vue'
import FaqList        from '@/Components/Storefront/FaqList.vue'

defineProps({
    sliders:           { type: Array, default: () => [] },
    categories:        { type: Array, default: () => [] },
    featuredBrands:    { type: Array, default: () => [] },
    flashSaleProducts: { type: Array, default: () => [] },
    faqs:              { type: Array, default: () => [] },
})
</script>

<template>
    <Head title="Beranda" />

    <h1 class="vh">CINENOVA — Top Up Game, Pulsa, dan Voucher Digital</h1>

    <div class="site-container py-6 flex flex-col gap-12">
        <HeroSlider :sliders="sliders" />
        <CategoryGrid :categories="categories" />
        <BrandGrid
            :brands="featuredBrands"
            title="Brand Populer"
            :see-all="featuredBrands.length ? '/kategori/game' : null"
        />
        <FlashSaleStrip :products="flashSaleProducts" />
        <FaqList :faqs="faqs" />
    </div>
</template>
