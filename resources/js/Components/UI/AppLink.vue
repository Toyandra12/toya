<script setup>
/**
 * AppLink — text-link primitive (UI guidelines §4.1).
 * Variants: inline (within prose), standalone (nav/menu), meta (footer/legal).
 * External links automatically add rel="noopener noreferrer" and a
 * visually-hidden "opens in new tab" hint for screen readers.
 */
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'

const props = defineProps({
    href:     { type: String, required: true },
    variant:  { type: String, default: 'inline' }, // inline|standalone|meta
    current:  { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    external: { type: Boolean, default: false },
})

const variantClass = computed(() => ({
    inline: [
        'underline underline-offset-2 text-fg-secondary',
        'hover:text-fg-primary',
        'active:text-fg-tertiary',
    ].join(' '),
    standalone: [
        'no-underline text-fg-secondary',
        'hover:text-fg-primary hover:underline underline-offset-4',
        'active:text-fg-tertiary',
    ].join(' '),
    meta: [
        'no-underline text-fg-inverse text-sm',
        'hover:text-fg-secondary hover:underline underline-offset-4',
    ].join(' '),
}[props.variant] || ''))

const stateClass = computed(() => [
    props.current ? 'text-fg-primary font-semibold' : '',
    props.disabled ? 'opacity-50 pointer-events-none' : '',
])

const baseClass = 'transition-colors duration-base ease-base focus-visible:rounded-xs'

// Auto-detect external links
const isExternal = computed(() =>
    props.external || /^(https?:|mailto:|tel:)/.test(props.href)
)
</script>

<template>
    <a
        v-if="isExternal"
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
        :class="[baseClass, variantClass, ...stateClass]"
        :aria-current="current ? 'page' : undefined"
        :aria-disabled="disabled || undefined"
    >
        <slot />
        <span class="vh">opens in new tab</span>
    </a>

    <Link
        v-else
        :href="href"
        :class="[baseClass, variantClass, ...stateClass]"
        :aria-current="current ? 'page' : undefined"
        :aria-disabled="disabled || undefined"
    >
        <slot />
    </Link>
</template>
