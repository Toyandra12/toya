<script setup>
/**
 * Card — generic surface (UI guidelines §4.3).
 * Variants: product | promo | feature | compact
 * - default elevation: shadow-t4
 * - hover (hoverable=true): elevates to shadow-t1, translates y -2px
 * - skeleton (loading): preserves height; uses .skeleton utility
 * - disabled: opacity 0.6
 */
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'

const props = defineProps({
    variant:    { type: String, default: 'product' }, // product|promo|feature|compact
    href:       { type: String, default: null },
    hoverable:  { type: Boolean, default: false },
    disabled:   { type: Boolean, default: false },
    loading:    { type: Boolean, default: false },
    error:      { type: Boolean, default: false },
})

const variantShadow = computed(() => ({
    product: 'shadow-t4',
    promo:   'shadow-t3',
    feature: 'shadow-t4',
    compact: '',
}[props.variant] || 'shadow-t4'))

const surface = computed(() => ({
    product: 'bg-surface-raised',
    promo:   'bg-surface-raised',
    feature: 'bg-surface-muted',
    compact: 'bg-surface-raised',
}[props.variant] || 'bg-surface-raised'))

const padding = computed(() => props.variant === 'compact' ? 'p-3' : 'p-4')

const interactiveClass = computed(() => {
    if (props.disabled) return 'opacity-60'
    if (!props.hoverable && !props.href) return ''
    return [
        'transition duration-base ease-base',
        '@media(hover:hover){hover:shadow-t1 hover:-translate-y-0.5}',
        'focus-visible:shadow-focus',
    ].join(' ')
})

const isLink = computed(() => !!props.href && !props.disabled)
</script>

<template>
    <component
        :is="isLink ? Link : 'div'"
        :href="isLink ? href : undefined"
        :class="[
            'block relative rounded-md overflow-hidden',
            surface, padding, variantShadow, interactiveClass,
            error ? 'ring-1 ring-fg-tertiary' : '',
        ]"
        :aria-busy="loading || undefined"
        :aria-disabled="disabled || undefined"
    >
        <!-- Skeleton overlay preserves layout footprint per A11Y-7. -->
        <template v-if="loading">
            <div class="skeleton h-32 w-full mb-3" aria-hidden="true" />
            <div class="skeleton h-4 w-3/4 mb-2" aria-hidden="true" />
            <div class="skeleton h-4 w-1/2" aria-hidden="true" />
            <span class="vh">Memuat…</span>
        </template>

        <slot v-else />
    </component>
</template>
