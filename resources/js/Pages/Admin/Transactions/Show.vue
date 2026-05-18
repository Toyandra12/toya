<template>
  <AdminLayout>
    <div class="max-w-3xl space-y-5">
      <div class="flex items-center gap-4">
        <Link :href="route('admin.transactions.index')" class="text-gray-400 hover:text-gray-600">← Kembali</Link>
        <h1 class="text-xl font-bold text-gray-900">{{ transaction.invoice_number }}</h1>
        <span :class="`badge badge-${statusColor(transaction.status)}`">{{ transaction.status_label }}</span>
      </div>

      <!-- Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="card p-5 space-y-3">
          <h2 class="font-semibold text-gray-800 border-b pb-2">Detail Transaksi</h2>
          <InfoRow label="Invoice" :value="transaction.invoice_number" mono />
          <InfoRow label="User" :value="`${transaction.user?.name} (${transaction.user?.email})`" />
          <InfoRow label="Produk" :value="transaction.product?.name" />
          <InfoRow label="Tujuan" :value="transaction.customer_no" />
          <InfoRow label="Supplier" :value="transaction.supplier" />
          <InfoRow label="Ref Supplier" :value="transaction.supplier_ref" mono />
          <InfoRow label="TRX Supplier" :value="transaction.supplier_trx_id" mono />
          <InfoRow label="Serial Number" :value="transaction.sn" mono />
          <InfoRow label="Pesan Supplier" :value="transaction.supplier_message" />
        </div>

        <div class="card p-5 space-y-3">
          <h2 class="font-semibold text-gray-800 border-b pb-2">Pembayaran</h2>
          <InfoRow label="Metode" :value="transaction.payment_method" />
          <InfoRow label="Status Bayar" :value="transaction.payment_status" />
          <InfoRow label="Channel" :value="transaction.payment_channel" />
          <InfoRow label="Harga Jual" :value="formatRupiah(transaction.sell_price)" />
          <InfoRow label="Diskon" :value="formatRupiah(transaction.discount)" />
          <InfoRow label="Total" :value="formatRupiah(transaction.total_amount)" bold />
          <InfoRow label="Waktu Bayar" :value="transaction.paid_at ? new Date(transaction.paid_at).toLocaleString('id-ID') : '-'" />
        </div>
      </div>

      <!-- Update Status Form -->
      <div class="card p-5">
        <h2 class="font-semibold text-gray-800 mb-4">Update Status</h2>
        <form @submit.prevent="updateStatus" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Status</label>
              <select v-model="statusForm.status" class="input">
                <option v-for="(label, key) in statuses" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="label">Serial Number / Token</label>
              <input v-model="statusForm.sn" type="text" placeholder="SN (opsional)" class="input" />
            </div>
          </div>
          <div>
            <label class="label">Catatan Admin</label>
            <textarea v-model="statusForm.admin_note" rows="2" class="input resize-none" placeholder="Catatan internal..."></textarea>
          </div>
          <div class="flex gap-3">
            <button type="submit" class="btn-primary">Simpan Status</button>
            <button v-if="canRetry" type="button" @click="retry" class="btn-secondary">↺ Proses Ulang</button>
            <button v-if="isDigiflazz" type="button" @click="checkDigiflazz" class="btn-secondary">🔍 Cek Digiflazz</button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({ transaction: Object, statuses: Object });

const statusForm = reactive({
  status: props.transaction.status,
  admin_note: props.transaction.admin_note ?? '',
  sn: props.transaction.sn ?? '',
});

const canRetry    = computed(() => ['failed', 'processing'].includes(props.transaction.status));
const isDigiflazz = computed(() => props.transaction.supplier === 'digiflazz' && props.transaction.supplier_ref);

function updateStatus() {
  router.put(route('admin.transactions.update-status', props.transaction.id), statusForm);
}
function retry() {
  if (!confirm('Proses ulang transaksi ini?')) return;
  router.post(route('admin.transactions.retry', props.transaction.id));
}
function checkDigiflazz() {
  router.post(route('admin.transactions.check-digiflazz', props.transaction.id));
}
function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
function statusColor(s) { return { pending:'warning', paid:'info', processing:'info', success:'success', failed:'danger', cancelled:'gray' }[s] ?? 'gray'; }

const InfoRow = {
  props: ['label', 'value', 'mono', 'bold'],
  template: `
    <div class="flex justify-between items-start gap-2 text-sm">
      <span class="text-gray-500 flex-shrink-0">{{ label }}</span>
      <span :class="['text-right', mono ? 'font-mono text-xs' : '', bold ? 'font-bold text-gray-900' : 'text-gray-700']">{{ value || '-' }}</span>
    </div>
  `,
};
</script>
