<script setup>
/**
 * Breadcrumbs — orientation aid (UI guideline §4.1 link variants).
 * Last item is the current page (aria-current="page", non-link).
 */
import AppLink from '@/Components/UI/AppLink.vue'

defineProps({
    /** [{ label, href? }] — last item should omit href. */
    items: { type: Array, default: () => [] },
})
</script>

<template>
    <nav aria-label="Breadcrumb" class="text-sm">
        <ol class="flex flex-wrap items-center gap-t5 text-fg-inverse">
            <li v-for="(item, i) in items" :key="i" class="flex items-center gap-t5">
                <AppLink
                    v-if="item.href"
                    :href="item.href"
                    variant="meta"
                    class="text-sm hover:text-fg-secondary"
                >
                    {{ item.label }}
                </AppLink>
                <span v-else aria-current="page" class="text-fg-primary font-medium">
                    {{ item.label }}
                </span>
                <span v-if="i < items.length - 1" aria-hidden="true">/</span>
            </li>
        </ol>
    </nav>
</template>
