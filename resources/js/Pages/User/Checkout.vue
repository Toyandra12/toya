<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div class="space-y-4">
        <!-- Product Summary -->
        <div class="card p-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Detail Produk</h2>
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-900">{{ product.name }}</p>
              <p class="text-sm text-gray-500">{{ product.brand?.name }} · {{ product.category?.name }}</p>
            </div>
            <span class="text-lg font-bold text-primary-600">{{ formatRupiah(product.sell_price) }}</span>
          </div>
        </div>

        <!-- Customer Info Form -->
        <div class="card p-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Informasi Akun</h2>
          <div v-for="field in product.brand?.form_fields" :key="field.name" class="mb-3">
            <label class="label">{{ field.label }} <span v-if="field.required" class="text-red-500">*</span></label>
            <input v-model="formData[field.name]" :type="field.type || 'text'" :placeholder="field.label" class="input" :required="field.required" />
          </div>
          <div v-if="!product.brand?.form_fields?.length">
            <label class="label">Nomor Tujuan <span class="text-red-500">*</span></label>
            <input v-model="customerNo" type="text" placeholder="Masukkan nomor tujuan" class="input" required />
          </div>
        </div>

        <!-- Gift Toggle -->
        <div class="card p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">🎁 Kirim sebagai Hadiah</p>
              <p class="text-xs text-gray-500 mt-0.5">Top up langsung ke orang lain</p>
            </div>
            <button @click="isGift = !isGift" :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors', isGift ? 'bg-primary-600' : 'bg-gray-200']">
              <span :class="['inline-block h-4 w-4 rounded-full bg-white transition-transform shadow', isGift ? 'translate-x-6' : 'translate-x-1']"></span>
            </button>
          </div>
          <Transition name="slide-down">
            <div v-if="isGift" class="mt-4 space-y-3 border-t pt-4">
              <div>
                <label class="label">Email / No. HP Penerima</label>
                <input v-model="giftRecipient" type="text" placeholder="Email atau nomor HP penerima" class="input" />
              </div>
              <div>
                <label class="label">Pesan (opsional)</label>
                <textarea v-model="giftMessage" rows="2" placeholder="Tulis pesan hadiah..." class="input resize-none"></textarea>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Voucher -->
        <div class="card p-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Voucher</h2>
          <div class="flex gap-2">
            <input v-model="voucherCode" type="text" placeholder="Masukkan kode voucher" class="input flex-1 uppercase" @input="voucherCode = voucherCode.toUpperCase()" />
            <button @click="validateVoucher" :disabled="!voucherCode || checkingVoucher" class="btn-secondary px-4">
              Gunakan
            </button>
          </div>
          <div v-if="voucherResult" :class="['mt-2 text-sm', voucherResult.valid ? 'text-green-600' : 'text-red-500']">
            {{ voucherResult.valid ? `✓ Diskon ${formatRupiah(voucherResult.discount)} diterapkan` : voucherResult.message }}
          </div>
        </div>

        <!-- Payment Method -->
        <div class="card p-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Metode Pembayaran</h2>
          <div class="space-y-2">
            <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all"
              :class="paymentMethod === 'midtrans' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'">
              <input v-model="paymentMethod" type="radio" value="midtrans" class="hidden" />
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">💳</div>
              <div>
                <p class="text-sm font-medium text-gray-800">Midtrans</p>
                <p class="text-xs text-gray-500">Transfer, VA, QRIS, E-Wallet</p>
              </div>
            </label>
            <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all"
              :class="paymentMethod === 'saldo' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'">
              <input v-model="paymentMethod" type="radio" value="saldo" class="hidden" />
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">💰</div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">Saldo Akun</p>
                <p class="text-xs text-gray-500">Saldo: {{ formatRupiah(userSaldo) }}</p>
              </div>
              <span v-if="userSaldo < totalAmount" class="text-xs text-red-500">Tidak cukup</span>
            </label>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="card p-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Ringkasan Pesanan</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Harga Produk</span>
              <span>{{ formatRupiah(product.sell_price) }}</span>
            </div>
            <div v-if="voucherResult?.valid" class="flex justify-between text-green-600">
              <span>Diskon Voucher</span>
              <span>- {{ formatRupiah(voucherResult.discount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
              <span>Total Bayar</span>
              <span class="text-primary-600">{{ formatRupiah(totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button @click="placeOrder" :disabled="loading" class="btn-primary w-full text-base py-3">
          <span v-if="loading" class="animate-spin mr-2">⟳</span>
          {{ loading ? 'Memproses...' : `Bayar ${formatRupiah(totalAmount)}` }}
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { router } from '@inertiajs/vue3';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({
  product: Object,
  clientKey: String,
  userSaldo: Number,
});

const formData = reactive({});
const customerNo = ref('');
const isGift = ref(false);
const giftRecipient = ref('');
const giftMessage = ref('');
const voucherCode = ref('');
const voucherResult = ref(null);
const checkingVoucher = ref(false);
const paymentMethod = ref('midtrans');
const loading = ref(false);

const discount = computed(() => voucherResult.value?.valid ? voucherResult.value.discount : 0);
const totalAmount = computed(() => Math.max(0, props.product.sell_price - discount.value));

async function validateVoucher() {
  checkingVoucher.value = true;
  try {
    const res = await axios.post('/checkout/voucher', {
      code: voucherCode.value,
      amount: props.product.sell_price,
    });
    voucherResult.value = res.data;
  } finally {
    checkingVoucher.value = false;
  }
}

async function placeOrder() {
  loading.value = true;
  try {
    const firstField = props.product.brand?.form_fields?.[0];
    const cn = firstField ? formData[firstField.name] : customerNo.value;

    const res = await axios.post('/checkout/order', {
      product_id: props.product.id,
      customer_no: cn,
      customer_data: formData,
      payment_method: paymentMethod.value,
      voucher_code: voucherResult.value?.valid ? voucherCode.value : null,
      is_gift: isGift.value,
      gift_recipient: giftRecipient.value,
      gift_message: giftMessage.value,
    });

    if (paymentMethod.value === 'saldo') {
      router.visit(res.data.redirect);
    } else {
      // Midtrans Snap
      window.snap.pay(res.data.snap_token, {
        onSuccess: () => router.visit(`/transaksi/${res.data.invoice_number}`),
        onPending: () => router.visit(`/transaksi/${res.data.invoice_number}`),
        onError:   () => router.visit(`/transaksi/${res.data.invoice_number}`),
        onClose:   () => { loading.value = false; },
      });
    }
  } catch (e) {
    const msg = e.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
    alert(msg);
  } finally {
    loading.value = false;
  }
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}
</script>
