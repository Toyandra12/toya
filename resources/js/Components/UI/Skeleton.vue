<script setup>
/**
 * Skeleton — preserve layout footprint during async loading (A11Y-7).
 * Always render with aria-hidden so the announced label belongs to the
 * surrounding container's `aria-busy="true"`.
 */
defineProps({
    width:  { type: String, default: '100%' },
    height: { type: String, default: '16px' },
    radius: { type: String, default: '10px' },
})
</script>

<template>
    <div
        class="skeleton"
        aria-hidden="true"
        :style="{ width, height, borderRadius: radius }"
    />
</template>
