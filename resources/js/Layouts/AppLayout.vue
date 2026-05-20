<script setup>
/**
 * AppLayout — default storefront shell.
 * Composition: SiteHeader (primary nav region) + main content + SiteFooter
 * (secondary nav region). Two navigation regions max per UI guideline §4.6.
 */
import SiteHeader  from '@/Components/Layout/SiteHeader.vue'
import SiteFooter  from '@/Components/Layout/SiteFooter.vue'
import FlashBanner from '@/Components/Layout/FlashBanner.vue'
</script>

<template>
    <div class="min-h-screen flex flex-col bg-surface-base text-fg-primary">
        <SiteHeader />
        <FlashBanner />

        <main
            id="main-content"
            tabindex="-1"
            class="flex-1 outline-none"
        >
            <slot />
        </main>

        <SiteFooter />
    </div>
</template>
