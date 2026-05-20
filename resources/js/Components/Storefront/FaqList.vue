<script setup>
/**
 * FaqList — accessible disclosure list using <details>/<summary>.
 * Native semantics give us keyboard support, screen-reader state, and
 * Esc-to-close out of the box.
 */
import { ref } from 'vue'

const props = defineProps({
    faqs: { type: Array, default: () => [] },
})

const openId = ref(null)

function toggle(id, e) {
    // Allow only one open at a time for a clean reading experience.
    if (openId.value === id) {
        openId.value = null
    } else {
        openId.value = id
    }
    e.preventDefault()
}
</script>

<template>
    <section v-if="faqs.length" id="faq" aria-labelledby="faq-heading">
        <header class="mb-4">
            <h2 id="faq-heading" class="text-3xl font-semibold mb-t5">Pertanyaan Umum</h2>
            <p class="text-sm text-fg-inverse">Jawaban cepat untuk pertanyaan paling sering diajukan.</p>
        </header>

        <ul class="flex flex-col gap-t5" role="list">
            <li
                v-for="faq in faqs"
                :key="faq.id"
                class="bg-surface-raised rounded-sm overflow-hidden"
            >
                <details
                    :open="openId === faq.id"
                    class="group"
                >
                    <summary
                        class="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer text-md font-medium text-fg-primary hover:bg-surface-muted focus-visible:shadow-focus list-none"
                        @click="toggle(faq.id, $event)"
                    >
                        <span>{{ faq.question }}</span>
                        <span
                            class="text-fg-tertiary text-2xl transition-transform duration-base ease-base"
                            :class="openId === faq.id ? 'rotate-45' : ''"
                            aria-hidden="true"
                        >+</span>
                    </summary>
                    <div class="px-4 pb-3 text-sm text-fg-secondary border-t border-surface-muted pt-3">
                        {{ faq.answer }}
                    </div>
                </details>
            </li>
        </ul>
    </section>
</template>
