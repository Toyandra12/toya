<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <!-- Status Banner -->
      <div :class="[`bg-${colorMap[transaction.status]}-50 border border-${colorMap[transaction.status]}-200`, 'rounded-xl p-5 mb-6 text-center']">
        <p class="text-3xl mb-2">{{ iconMap[transaction.status] }}</p>
        <h1 class="text-lg font-bold text-gray-900">{{ transaction.status_label }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ transaction.invoice_number }}</p>
        <!-- Auto-refresh for pending/processing -->
        <p v-if="['pending','paid','processing'].includes(transaction.status)" class="text-xs text-gray-400 mt-2">
          Auto-refresh dalam {{ countdown }}s
        </p>
      </div>

      <!-- Details -->
      <div class="card divide-y">
        <div class="p-4 flex justify-between">
          <span class="text-sm text-gray-500">Produk</span>
          <span class="text-sm font-medium text-right">{{ transaction.product?.name }}</span>
        </div>
        <div class="p-4 flex justify-between">
          <span class="text-sm text-gray-500">Tujuan</span>
          <span class="text-sm font-medium">{{ transaction.customer_no }}</span>
        </div>
        <div v-if="transaction.sn" class="p-4">
          <p class="text-sm text-gray-500 mb-1">Serial Number / Token</p>
          <div class="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
            <span class="font-mono text-sm font-bold text-gray-800 break-all">{{ transaction.sn }}</span>
            <button @click="copySn" class="ml-3 text-primary-600 hover:text-primary-700 text-xs font-medium flex-shrink-0">
              {{ copied ? '✓ Disalin' : 'Salin' }}
            </button>
          </div>
        </div>
        <div class="p-4 flex justify-between">
          <span class="text-sm text-gray-500">Metode Bayar</span>
          <span class="text-sm font-medium capitalize">{{ transaction.payment_method }}</span>
        </div>
        <div class="p-4 flex justify-between">
          <span class="text-sm text-gray-500">Total Bayar</span>
          <span class="text-base font-bold text-primary-600">{{ formatRupiah(transaction.total_amount) }}</span>
        </div>
        <div v-if="transaction.is_gift" class="p-4 bg-pink-50">
          <p class="text-sm font-medium text-pink-700">🎁 Hadiah untuk: {{ transaction.gift_recipient_contact }}</p>
          <p v-if="transaction.gift_message" class="text-xs text-pink-600 mt-1">{{ transaction.gift_message }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex gap-3">
        <Link href="/transaksi" class="btn-secondary flex-1 text-center">Riwayat Transaksi</Link>
        <Link href="/" class="btn-primary flex-1 text-center">Beli Lagi</Link>
      </div>

      <!-- Pay Now (if pending with snap token) -->
      <div v-if="transaction.status === 'pending' && transaction.midtrans_snap_token" class="mt-3">
        <button @click="payNow" class="btn-primary w-full py-3 text-base">Bayar Sekarang</button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({ transaction: Object, clientKey: String });

const copied = ref(false);
const countdown = ref(10);
let timer = null;
let refreshTimer = null;

const colorMap = { pending: 'yellow', paid: 'blue', processing: 'indigo', success: 'green', failed: 'red', cancelled: 'gray', refunded: 'purple' };
const iconMap  = { pending: '⏳', paid: '💳', processing: '⚙️', success: '✅', failed: '❌', cancelled: '🚫', refunded: '↩️' };

function copySn() {
  navigator.clipboard.writeText(props.transaction.sn);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}

function payNow() {
  window.snap.pay(props.transaction.midtrans_snap_token, {
    onSuccess: () => router.reload(),
    onPending: () => router.reload(),
    onError:   () => router.reload(),
  });
}

onMounted(() => {
  if (['pending', 'paid', 'processing'].includes(props.transaction.status)) {
    timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        countdown.value = 10;
        checkStatus();
      }
    }, 1000);
  }
});

onUnmounted(() => {
  clearInterval(timer);
});

async function checkStatus() {
  try {
    const res = await axios.get(`/transaksi/${props.transaction.invoice_number}/status`);
    if (res.data.status !== props.transaction.status) {
      router.reload();
    }
  } catch (e) { /* ignore */ }
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}
</script>
