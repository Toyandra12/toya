<script setup>
/**
 * Badge — small pill for status/sale/notification counts.
 * Tone never communicates state alone; pair with a textual label.
 */
import { computed } from 'vue'

const props = defineProps({
    tone: { type: String, default: 'brand' }, // brand|neutral|warn
})

const toneClass = computed(() => ({
    brand:   'bg-fg-tertiary text-fg-primary',
    neutral: 'bg-surface-muted text-fg-secondary',
    warn:    'bg-surface-raised text-fg-tertiary border border-fg-tertiary',
}[props.tone] || ''))
</script>

<template>
    <span
        :class="[
            'inline-flex items-center justify-center px-t7 py-t3',
            'text-xs font-semibold rounded-xl whitespace-nowrap',
            toneClass,
        ]"
    >
        <slot />
    </span>
</template>
