<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" class="hover:text-primary-600">Beranda</Link>
        <span>/</span>
        <Link :href="`/kategori/${category.slug}`" class="hover:text-primary-600">{{ category.name }}</Link>
        <span>/</span>
        <span class="text-gray-800 font-medium">{{ brand.name }}</span>
      </nav>

      <!-- Brand Header -->
      <div class="card p-6 mb-6 flex items-center gap-5">
        <div class="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center text-3xl font-bold text-primary-700">
          {{ brand.name.charAt(0) }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ brand.name }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ brand.description || `Top up ${brand.name} mudah dan cepat` }}</p>
        </div>
      </div>

      <!-- Form + Products -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Left: Input Form -->
        <div class="lg:col-span-2">
          <div class="card p-5 sticky top-24">
            <h2 class="text-base font-semibold text-gray-800 mb-4">Masukkan Data</h2>
            <form @submit.prevent="checkAccount">
              <div v-for="field in brand.form_fields" :key="field.name" class="mb-4">
                <label class="label">{{ field.label }} <span v-if="field.required" class="text-red-500">*</span></label>
                <input
                  v-model="formData[field.name]"
                  :type="field.type || 'text'"
                  :placeholder="field.label"
                  class="input"
                  :required="field.required"
                />
              </div>
              <button v-if="needsInquiry" type="submit" :disabled="checkingAccount" class="btn-secondary w-full">
                <span v-if="checkingAccount" class="animate-spin mr-2">⟳</span>
                Cek Akun
              </button>
            </form>

            <!-- Account info result -->
            <div v-if="accountInfo" class="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              <p class="font-medium">{{ accountInfo.nickname || accountInfo.name || 'Akun ditemukan' }}</p>
              <p v-if="accountInfo.server" class="text-xs text-green-600">Server: {{ accountInfo.server }}</p>
            </div>
          </div>
        </div>

        <!-- Right: Products -->
        <div class="lg:col-span-3">
          <h2 class="text-base font-semibold text-gray-800 mb-4">Pilih Nominal</h2>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="product in products"
              :key="product.id"
              @click="selectProduct(product)"
              :class="['card p-4 text-left hover:border-primary-400 hover:shadow-md transition-all border-2',
                selectedProduct?.id === product.id ? 'border-primary-500 bg-primary-50' : 'border-transparent']"
            >
              <p class="text-sm font-semibold text-gray-800">{{ product.name }}</p>
              <p class="text-base font-bold text-primary-600 mt-1">{{ formatRupiah(product.sell_price) }}</p>
              <span v-if="product.is_featured" class="text-xs text-orange-500 font-medium">⭐ Favorit</span>
            </button>
          </div>

          <!-- Proceed -->
          <div v-if="selectedProduct" class="mt-6 card p-4 border-primary-200 bg-primary-50">
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm text-gray-700">Produk dipilih:</span>
              <span class="font-semibold text-gray-900">{{ selectedProduct.name }}</span>
            </div>
            <div class="flex justify-between items-center mb-4">
              <span class="text-sm text-gray-700">Total:</span>
              <span class="text-lg font-bold text-primary-700">{{ formatRupiah(selectedProduct.sell_price) }}</span>
            </div>
            <Link
              :href="`/checkout/${selectedProduct.id}?${buildQuery()}`"
              class="btn-primary w-full text-center"
            >
              Lanjut Pembayaran
            </Link>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({
  category: Object,
  brand: Object,
  products: Array,
});

const formData = reactive({});
const selectedProduct = ref(null);
const checkingAccount = ref(false);
const accountInfo = ref(null);

const needsInquiry = computed(() => props.brand.form_fields?.length > 0);

function selectProduct(product) {
  selectedProduct.value = product;
}

async function checkAccount() {
  if (!selectedProduct.value) return;
  checkingAccount.value = true;
  accountInfo.value = null;
  try {
    const res = await axios.post('/checkout/inquiry', {
      product_id: selectedProduct.value.id,
      customer_no: formData[props.brand.form_fields?.[0]?.name] ?? '',
      zone_id: formData.zone_id ?? '',
    });
    accountInfo.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    checkingAccount.value = false;
  }
}

function buildQuery() {
  const params = new URLSearchParams();
  Object.entries(formData).forEach(([k, v]) => {
    if (v) params.append(k, v);
  });
  return params.toString();
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}
</script>
