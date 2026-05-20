<script setup>
/**
 * Flash messages — surfaces success/error/warning from the Inertia shared
 * `flash` props with a single non-blocking region (A11Y-6).
 */
import { computed, ref, watch } from 'vue'
import { usePage } from '@inertiajs/vue3'

const page = usePage()
const visible = ref(false)
const message = ref('')
const tone    = ref('success') // success|error|warning

const flash = computed(() => page.props.flash || {})

watch(flash, (next) => {
    if (next.success) {
        message.value = next.success; tone.value = 'success'; visible.value = true
    } else if (next.error) {
        message.value = next.error;   tone.value = 'error';   visible.value = true
    } else if (next.warning) {
        message.value = next.warning; tone.value = 'warning'; visible.value = true
    }
    if (visible.value) setTimeout(() => { visible.value = false }, 4000)
}, { immediate: true, deep: true })

const toneClass = computed(() => ({
    success: 'bg-surface-raised text-fg-primary border border-fg-tertiary',
    error:   'bg-fg-tertiary text-fg-primary',
    warning: 'bg-surface-raised text-fg-primary border border-fg-secondary',
}[tone.value]))
</script>

<template>
    <div
        v-if="visible"
        :class="[
            'fixed top-20 right-4 z-50 max-w-sm px-4 py-3 rounded-sm shadow-t4',
            toneClass,
        ]"
        :role="tone === 'error' ? 'alert' : 'status'"
        :aria-live="tone === 'error' ? 'assertive' : 'polite'"
    >
        <p class="text-sm">{{ message }}</p>
    </div>
</template>
