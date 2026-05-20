<script setup>
/**
 * Button — primary interactive primitive.
 * Implements all 7 states (default, hover, focus-visible, active, disabled,
 * loading, error) per docs/ui-guidelines.md §4.2.
 *
 * Variants: primary | secondary | ghost | destructive
 * Sizes: sm (36px) | md (44px) | lg (52px)
 *
 * Touch targets ≥44×44 (md/lg by default; sm uses padding to compensate).
 */
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'

const props = defineProps({
    variant:  { type: String, default: 'primary' },  // primary|secondary|ghost|destructive
    size:     { type: String, default: 'md' },       // sm|md|lg
    type:     { type: String, default: 'button' },
    href:     { type: String, default: null },       // when set, renders Inertia Link
    external: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    loading:  { type: Boolean, default: false },
    error:    { type: Boolean, default: false },
    block:    { type: Boolean, default: false },
    iconOnly: { type: Boolean, default: false },
    ariaLabel:{ type: String, default: null },
})

const emit = defineEmits(['click'])

const variantClass = computed(() => ({
    primary: [
        'bg-fg-tertiary text-fg-primary',
        'hover:shadow-t1 hover:-translate-y-px',
        'active:translate-y-px active:opacity-90',
    ].join(' '),
    secondary: [
        'bg-transparent text-fg-tertiary border border-fg-tertiary',
        'hover:bg-surface-muted',
        'active:opacity-90',
    ].join(' '),
    ghost: [
        'bg-transparent text-fg-secondary',
        'hover:text-fg-primary hover:bg-surface-muted',
        'active:opacity-90',
    ].join(' '),
    destructive: [
        'bg-brand-accent text-fg-primary',
        'hover:shadow-t1 hover:-translate-y-px',
        'active:translate-y-px active:opacity-90',
    ].join(' '),
}[props.variant] || ''))

const sizeClass = computed(() => ({
    sm: props.iconOnly ? 'h-11 w-11 text-sm' : 'h-9 px-t7 text-sm gap-t5',
    md: props.iconOnly ? 'h-11 w-11 text-md' : 'h-11 px-4 text-md gap-t5',
    lg: props.iconOnly ? 'h-13 w-13 text-lg' : 'h-13 px-5 text-lg gap-t7',
}[props.size] || ''))

const radiusClass = computed(() => props.iconOnly ? 'rounded-xl' : 'rounded-sm')

const isDisabled = computed(() => props.disabled || props.loading)

const computedAriaLabel = computed(() => {
    if (props.ariaLabel) return props.ariaLabel
    if (props.iconOnly) return undefined // caller MUST pass aria-label for icon-only
    return undefined
})

function onClick(e) {
    if (isDisabled.value) {
        e.preventDefault()
        return
    }
    emit('click', e)
}
</script>

<template>
    <!-- External anchor: use plain <a> with rel for security -->
    <a
        v-if="href && external"
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
        :class="[
            'inline-flex items-center justify-center select-none',
            'font-medium whitespace-nowrap transition duration-base ease-base',
            'focus-visible:shadow-focus',
            radiusClass, sizeClass, variantClass,
            block ? 'w-full' : '',
            error ? '!border-fg-tertiary !ring-1 !ring-fg-tertiary' : '',
            isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        ]"
        :aria-label="computedAriaLabel"
        :aria-disabled="isDisabled || undefined"
        :aria-busy="loading || undefined"
    >
        <slot name="leading" v-if="$slots.leading && !loading" />
        <span v-if="loading" class="inline-block h-4 w-4 animate-spin rounded-xl border-2 border-current border-t-transparent" aria-hidden="true" />
        <span v-if="!iconOnly"><slot /></span>
        <slot name="trailing" v-if="$slots.trailing" />
        <span class="vh">opens in new tab</span>
    </a>

    <!-- Inertia Link (internal navigation) -->
    <Link
        v-else-if="href"
        :href="href"
        :class="[
            'inline-flex items-center justify-center select-none',
            'font-medium whitespace-nowrap transition duration-base ease-base',
            'focus-visible:shadow-focus',
            radiusClass, sizeClass, variantClass,
            block ? 'w-full' : '',
            error ? '!border-fg-tertiary !ring-1 !ring-fg-tertiary' : '',
            isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        ]"
        :aria-label="computedAriaLabel"
        :aria-disabled="isDisabled || undefined"
        :aria-busy="loading || undefined"
    >
        <slot name="leading" v-if="$slots.leading && !loading" />
        <span v-if="loading" class="inline-block h-4 w-4 animate-spin rounded-xl border-2 border-current border-t-transparent" aria-hidden="true" />
        <span v-if="!iconOnly"><slot /></span>
        <slot name="trailing" v-if="$slots.trailing" />
    </Link>

    <!-- Native button -->
    <button
        v-else
        :type="type"
        :class="[
            'inline-flex items-center justify-center select-none',
            'font-medium whitespace-nowrap transition duration-base ease-base',
            'focus-visible:shadow-focus',
            radiusClass, sizeClass, variantClass,
            block ? 'w-full' : '',
            error ? '!border-fg-tertiary !ring-1 !ring-fg-tertiary' : '',
            isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ]"
        :aria-label="computedAriaLabel"
        :aria-disabled="isDisabled || undefined"
        :aria-busy="loading || undefined"
        :disabled="isDisabled"
        @click="onClick"
    >
        <slot name="leading" v-if="$slots.leading && !loading" />
        <span v-if="loading" class="inline-block h-4 w-4 animate-spin rounded-xl border-2 border-current border-t-transparent" aria-hidden="true" />
        <span v-if="!iconOnly"><slot /></span>
        <slot name="trailing" v-if="$slots.trailing" />
    </button>
</template>
