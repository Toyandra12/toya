<script setup>
/**
 * EmptyState — required for any list/grid that may render zero items.
 * UI guideline §4.4: heading + supporting text + primary action.
 */
defineProps({
    title:       { type: String, required: true },
    description: { type: String, default: '' },
})
</script>

<template>
    <div class="flex flex-col items-center justify-center text-center py-12 px-4">
        <div
            class="h-16 w-16 rounded-xl bg-surface-muted flex items-center justify-center mb-4"
            aria-hidden="true"
        >
            <span class="text-3xl text-fg-inverse">∅</span>
        </div>
        <h3 class="text-lg font-semibold text-fg-primary mb-t5">{{ title }}</h3>
        <p v-if="description" class="text-sm text-fg-inverse max-w-md mb-4">{{ description }}</p>
        <slot />
    </div>
</template>
