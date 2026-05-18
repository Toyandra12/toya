<template>
  <AppLayout>
    <!-- Hero Slider -->
    <section class="relative">
      <div v-if="sliders.length" class="swiper-container overflow-hidden">
        <div class="relative">
          <div v-for="(slide, i) in sliders" :key="slide.id" v-show="activeSlide === i" class="relative h-48 sm:h-64 md:h-80 bg-gradient-to-r from-primary-700 to-primary-900 overflow-hidden">
            <div class="absolute inset-0 flex items-center">
              <div class="max-w-7xl mx-auto px-6 sm:px-12 w-full">
                <div class="max-w-lg">
                  <span v-if="slide.badge" :class="slide.badge_color || 'bg-yellow-400'" class="inline-block text-xs font-bold text-gray-900 px-2 py-1 rounded mb-3">{{ slide.badge }}</span>
                  <h2 class="text-2xl md:text-4xl font-extrabold text-white leading-tight">{{ slide.title }}</h2>
                  <p class="mt-2 text-primary-100 text-sm md:text-base">{{ slide.subtitle }}</p>
                  <Link v-if="slide.link" :href="slide.link" class="mt-4 inline-block btn-primary">
                    {{ slide.button_text || 'Lihat Selengkapnya' }}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Dots -->
        <div v-if="sliders.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          <button v-for="(_, i) in sliders" :key="i" @click="activeSlide = i"
            :class="['w-2 h-2 rounded-full transition-all', activeSlide === i ? 'bg-white w-5' : 'bg-white/50']"></button>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <!-- Categories -->
      <section>
        <h2 class="text-xl font-bold text-gray-900 mb-4">Kategori Produk</h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
          <Link v-for="cat in categories" :key="cat.id" :href="`/kategori/${cat.slug}`"
            class="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all group">
            <span class="text-2xl mb-1">{{ cat.icon }}</span>
            <span class="text-xs text-gray-600 text-center leading-tight group-hover:text-primary-600 transition-colors">{{ cat.name }}</span>
          </Link>
        </div>
      </section>

      <!-- Flash Sale -->
      <section v-if="flashSaleProducts.length">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold text-gray-900">⚡ Flash Sale</span>
            <span class="badge badge-danger text-xs animate-pulse">Terbatas!</span>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <ProductCard v-for="product in flashSaleProducts" :key="product.id" :product="product" />
        </div>
      </section>

      <!-- Featured Brands -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Brand Populer</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Link v-for="brand in featuredBrands" :key="brand.id"
            :href="`/kategori/${brand.category?.slug}/${brand.slug}`"
            class="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all group">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl mb-2">
              {{ brand.name.charAt(0) }}
            </div>
            <span class="text-xs text-center font-medium text-gray-700 group-hover:text-primary-600 leading-tight">{{ brand.name }}</span>
            <span class="text-xs text-gray-400 mt-0.5">{{ brand.category?.name }}</span>
          </Link>
        </div>
      </section>

      <!-- FAQ -->
      <section v-if="faqs.length" id="faq">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Pertanyaan Umum</h2>
        <div class="space-y-2 max-w-3xl">
          <div v-for="faq in faqs" :key="faq.id" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <button @click="toggleFaq(faq.id)" class="w-full flex items-center justify-between p-4 text-left">
              <span class="text-sm font-medium text-gray-800">{{ faq.question }}</span>
              <ChevronDownIcon :class="['w-4 h-4 text-gray-400 flex-shrink-0 transition-transform', openFaqs.includes(faq.id) ? 'rotate-180' : '']" />
            </button>
            <Transition name="slide-down">
              <div v-if="openFaqs.includes(faq.id)" class="px-4 pb-4 text-sm text-gray-600 border-t border-gray-50 pt-3">
                {{ faq.answer }}
              </div>
            </Transition>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Link } from '@inertiajs/vue3';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import AppLayout from '@/Layouts/AppLayout.vue';
import ProductCard from '@/Components/Shared/ProductCard.vue';

const props = defineProps({
  sliders: Array,
  categories: Array,
  featuredBrands: Array,
  flashSaleProducts: Array,
  faqs: Array,
});

// Slider
const activeSlide = ref(0);
let sliderTimer = null;
onMounted(() => {
  if (props.sliders?.length > 1) {
    sliderTimer = setInterval(() => {
      activeSlide.value = (activeSlide.value + 1) % props.sliders.length;
    }, 4000);
  }
});
onUnmounted(() => clearInterval(sliderTimer));

// FAQ
const openFaqs = ref([]);
function toggleFaq(id) {
  const idx = openFaqs.value.indexOf(id);
  if (idx >= 0) openFaqs.value.splice(idx, 1);
  else openFaqs.value.push(id);
}
</script>
