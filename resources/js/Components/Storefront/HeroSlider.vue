<script setup>
/**
 * HeroSlider — auto-rotating banner with pause/play control (A11Y-15).
 * Honors prefers-reduced-motion: stops auto-advance, no transitions.
 * Keyboard: ArrowLeft/Right to navigate; Tab reaches dots and pause control.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Link } from '@inertiajs/vue3'

const props = defineProps({
    sliders: { type: Array, default: () => [] },
})

const index = ref(0)
const paused = ref(false)
const reduced = ref(false)
let timer = null

const slides = computed(() => props.sliders.length ? props.sliders : [
    { id: 'fallback', title: 'Top Up Lebih Cepat', subtitle: 'Game, pulsa, voucher dalam hitungan detik.', link: '/kategori/game', button_text: 'Mulai belanja', badge: 'NEW' },
])

function next() { index.value = (index.value + 1) % slides.value.length }
function prev() { index.value = (index.value - 1 + slides.value.length) % slides.value.length }
function go(i) { index.value = i }

function start() {
    stop()
    if (reduced.value || paused.value || slides.value.length <= 1) return
    timer = setInterval(next, 6000)
}
function stop() { if (timer) { clearInterval(timer); timer = null } }

function togglePause() {
    paused.value = !paused.value
    paused.value ? stop() : start()
}

function onKey(e) {
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
}

onMounted(() => {
    reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    start()
})
onBeforeUnmount(stop)
</script>

<template>
    <section
        class="relative overflow-hidden rounded-md bg-surface-raised"
        aria-roledescription="carousel"
        aria-label="Promosi unggulan"
        @mouseenter="stop"
        @mouseleave="start"
        @focusin="stop"
        @focusout="start"
        @keydown="onKey"
        tabindex="0"
    >
        <div class="relative aspect-[16/7] md:aspect-[21/7] w-full">
            <div
                v-for="(slide, i) in slides"
                :key="slide.id || i"
                class="absolute inset-0 transition-opacity duration-base ease-base"
                :style="{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }"
                :aria-hidden="i === index ? 'false' : 'true'"
                role="group"
                aria-roledescription="slide"
                :aria-label="`${i + 1} dari ${slides.length}`"
            >
                <img
                    v-if="slide.image"
                    :src="`/storage/${slide.image}`"
                    :alt="slide.title || ''"
                    class="absolute inset-0 h-full w-full object-cover"
                />
                <div
                    class="absolute inset-0"
                    :style="{ background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.2) 100%)' }"
                    aria-hidden="true"
                />
                <div class="relative h-full flex items-center">
                    <div class="site-container max-w-2xl">
                        <span
                            v-if="slide.badge"
                            class="inline-flex items-center px-t7 py-t3 rounded-xl text-xs font-semibold bg-fg-tertiary text-fg-primary mb-3"
                        >{{ slide.badge }}</span>
                        <h2 class="text-3xl md:text-4xl font-bold text-fg-primary mb-3">
                            {{ slide.title }}
                        </h2>
                        <p v-if="slide.subtitle" class="text-md md:text-lg text-fg-secondary mb-4 max-w-xl">
                            {{ slide.subtitle }}
                        </p>
                        <Link
                            v-if="slide.link"
                            :href="slide.link"
                            class="inline-flex items-center justify-center h-11 px-5 rounded-sm font-medium bg-fg-tertiary text-fg-primary hover:shadow-t1 hover:-translate-y-px transition duration-base ease-base focus-visible:shadow-focus"
                        >
                            {{ slide.button_text || 'Selengkapnya' }}
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        <!-- Controls -->
        <div
            v-if="slides.length > 1"
            class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-t7"
        >
            <button
                type="button"
                class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-surface-strong/80 text-fg-primary hover:bg-fg-tertiary focus-visible:shadow-focus transition-colors duration-base"
                aria-label="Slide sebelumnya"
                @click="prev"
            ><span aria-hidden="true">‹</span></button>

            <div role="tablist" aria-label="Navigasi slide" class="flex items-center gap-t5">
                <button
                    v-for="(_, i) in slides"
                    :key="i"
                    type="button"
                    role="tab"
                    :aria-selected="i === index"
                    :aria-label="`Slide ${i + 1}`"
                    class="h-3 w-3 rounded-xl transition-colors duration-base focus-visible:shadow-focus"
                    :class="i === index ? 'bg-fg-tertiary' : 'bg-fg-inverse hover:bg-fg-secondary'"
                    @click="go(i)"
                />
            </div>

            <button
                type="button"
                class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-surface-strong/80 text-fg-primary hover:bg-fg-tertiary focus-visible:shadow-focus transition-colors duration-base"
                aria-label="Slide berikutnya"
                @click="next"
            ><span aria-hidden="true">›</span></button>

            <button
                type="button"
                class="inline-flex h-11 px-t7 items-center justify-center rounded-xl bg-surface-strong/80 text-fg-primary text-xs hover:bg-fg-tertiary focus-visible:shadow-focus transition-colors duration-base"
                :aria-pressed="paused"
                @click="togglePause"
            >
                {{ paused ? 'Putar' : 'Jeda' }}
            </button>
        </div>
    </section>
</template>
