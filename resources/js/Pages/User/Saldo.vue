<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <!-- Balance Card -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <p class="text-sm font-medium text-primary-100">Saldo Akun Anda</p>
        <p class="text-4xl font-extrabold mt-1">{{ formatRupiah(user.saldo) }}</p>
        <button @click="topupModal = true" class="mt-4 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">
          + Top Up Saldo
        </button>
      </div>

      <!-- History -->
      <div class="card overflow-hidden">
        <div class="p-4 border-b font-semibold text-gray-800">Riwayat Saldo</div>
        <div v-if="!histories.data?.length" class="p-10 text-center text-gray-400">Belum ada riwayat</div>
        <div v-for="h in histories.data" :key="h.id" class="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50">
          <div>
            <p class="text-sm font-medium text-gray-800">{{ h.description }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ new Date(h.created_at).toLocaleString('id-ID') }}</p>
          </div>
          <div class="text-right">
            <p :class="h.type === 'credit' ? 'text-green-600' : 'text-red-600'" class="font-semibold">
              {{ h.type === 'credit' ? '+' : '-' }}{{ formatRupiah(h.amount) }}
            </p>
            <p class="text-xs text-gray-400">Sisa: {{ formatRupiah(h.balance_after) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Up Modal -->
    <Teleport to="body">
      <div v-if="topupModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
          <h2 class="text-lg font-bold text-gray-900">Top Up Saldo</h2>
          <div>
            <label class="label">Jumlah Top Up</label>
            <input v-model="amount" type="number" min="10000" step="10000" class="input" placeholder="Min. Rp 10.000" />
          </div>
          <!-- Quick amounts -->
          <div class="grid grid-cols-3 gap-2">
            <button v-for="q in [50000,100000,200000,500000,1000000,2000000]" :key="q" @click="amount = q"
              :class="['border rounded-lg py-1.5 text-xs font-medium transition-colors', amount == q ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300']">
              {{ formatRupiah(q) }}
            </button>
          </div>
          <div class="flex gap-3">
            <button @click="topupModal = false" class="btn-secondary flex-1">Batal</button>
            <button @click="doTopup" :disabled="!amount || loading" class="btn-primary flex-1">
              <span v-if="loading">...</span>
              <span v-else>Bayar</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({ user: Object, histories: Object, topups: Object, clientKey: String });

const topupModal = ref(false);
const amount = ref(null);
const loading = ref(false);

async function doTopup() {
  if (!amount.value) return;
  loading.value = true;
  try {
    const res = await axios.post('/saldo/topup', { amount: amount.value });
    topupModal.value = false;
    window.snap.pay(res.data.snap_token, {
      onSuccess: () => window.location.reload(),
      onPending: () => window.location.reload(),
      onError:   () => window.location.reload(),
    });
  } catch (e) {
    alert(e.response?.data?.message || 'Gagal membuat pembayaran');
  } finally {
    loading.value = false;
  }
}

function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
</script>
