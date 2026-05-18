<template>
  <AdminLayout>
    <div class="space-y-5">
      <h1 class="text-xl font-bold text-gray-900">Top Up Saldo</h1>
      <div class="card p-4 flex gap-3">
        <input v-model="f.search" type="text" placeholder="Invoice / email..." class="input flex-1" @keydown.enter="apply" />
        <select v-model="f.status" class="input w-36" @change="apply">
          <option value="">Semua</option>
          <option value="pending">Pending</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
        <button @click="apply" class="btn-primary">Filter</button>
      </div>
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Invoice</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">User</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Jumlah</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Pembayaran</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="t in topups.data" :key="t.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ t.invoice_number }}</td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ t.user?.name }}</p>
                <p class="text-xs text-gray-400">{{ t.user?.email }}</p>
              </td>
              <td class="px-4 py-3 text-right font-bold text-gray-900">{{ formatRupiah(t.amount) }}</td>
              <td class="px-4 py-3 text-center"><span :class="t.payment_status === 'paid' ? 'badge-success' : 'badge-warning'" class="badge">{{ t.payment_status }}</span></td>
              <td class="px-4 py-3 text-center"><span :class="t.status === 'approved' ? 'badge-success' : t.status === 'rejected' ? 'badge-danger' : 'badge-warning'" class="badge">{{ t.status }}</span></td>
              <td class="px-4 py-3 text-center">
                <div v-if="t.status === 'pending'" class="flex justify-center gap-2">
                  <button @click="approve(t)" class="text-green-600 text-xs font-medium">Setujui</button>
                  <button @click="openReject(t)" class="text-red-500 text-xs font-medium">Tolak</button>
                </div>
                <span v-else class="text-xs text-gray-400">{{ t.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reject Modal -->
    <Teleport to="body">
      <div v-if="rejectModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
          <h2 class="font-bold text-gray-900">Tolak Top Up Saldo</h2>
          <div><label class="label">Alasan (opsional)</label><input v-model="rejectNote" type="text" class="input" /></div>
          <div class="flex justify-end gap-3"><button @click="rejectModal=false" class="btn-secondary">Batal</button><button @click="reject" class="btn-danger">Tolak</button></div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({ topups: Object, filters: Object });
const f = reactive({ search: props.filters?.search ?? '', status: props.filters?.status ?? '' });
const rejectModal = ref(false);
const rejectNote = ref('');
const rejectTarget = ref(null);

function apply() { router.get(route('admin.saldo-topups.index'), f, { preserveState: true, replace: true }); }
function approve(t) { if (!confirm('Setujui top up ini?')) return; router.post(route('admin.saldo-topups.approve', t.id)); }
function openReject(t) { rejectTarget.value = t; rejectNote.value = ''; rejectModal.value = true; }
function reject() { router.post(route('admin.saldo-topups.reject', rejectTarget.value.id), { note: rejectNote.value }, { onSuccess: () => { rejectModal.value = false; } }); }
function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
</script>
