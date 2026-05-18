<template>
  <AdminLayout>
    <div class="max-w-4xl space-y-6">
      <div class="flex items-center gap-4">
        <Link :href="route('admin.users.index')" class="text-gray-400 hover:text-gray-600">← Kembali</Link>
        <h1 class="text-xl font-bold text-gray-900">{{ user.name }}</h1>
        <span :class="user.is_active ? 'badge-success' : 'badge-danger'" class="badge">{{ user.is_active ? 'Aktif' : 'Nonaktif' }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Profile Card -->
        <div class="card p-5">
          <div class="text-center mb-4">
            <img :src="user.avatar_url" class="w-20 h-20 rounded-full mx-auto object-cover mb-3" />
            <h2 class="font-bold text-gray-900">{{ user.name }}</h2>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ user.phone || 'No HP tidak ada' }}</p>
            <div class="mt-2 flex justify-center gap-2">
              <span v-for="role in user.roles" :key="role.id" class="badge badge-info capitalize text-xs">{{ role.name }}</span>
            </div>
          </div>
          <div class="border-t pt-4 text-center">
            <p class="text-2xl font-bold text-primary-600">{{ formatRupiah(user.saldo) }}</p>
            <p class="text-xs text-gray-400">Saldo Akun</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="md:col-span-2 space-y-4">
          <!-- Assign Role -->
          <div class="card p-5">
            <h3 class="font-semibold text-gray-800 mb-3">Ubah Role</h3>
            <form @submit.prevent="assignRole" class="flex gap-3">
              <select v-model="roleForm.role" class="input flex-1">
                <option value="user">user</option>
                <option value="operator">operator</option>
                <option value="admin">admin</option>
                <option value="super-admin">super-admin</option>
              </select>
              <button type="submit" class="btn-primary">Simpan</button>
            </form>
          </div>

          <!-- Adjust Saldo -->
          <div class="card p-5">
            <h3 class="font-semibold text-gray-800 mb-3">Sesuaikan Saldo</h3>
            <form @submit.prevent="adjustSaldo" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Tipe</label>
                  <select v-model="saldoForm.type" class="input">
                    <option value="credit">Tambah (Credit)</option>
                    <option value="debit">Kurangi (Debit)</option>
                  </select>
                </div>
                <div>
                  <label class="label">Jumlah</label>
                  <input v-model="saldoForm.amount" type="number" min="1" class="input" required />
                </div>
              </div>
              <div>
                <label class="label">Keterangan</label>
                <input v-model="saldoForm.description" type="text" class="input" placeholder="Alasan penyesuaian saldo" required />
              </div>
              <button type="submit" class="btn-primary">Simpan</button>
            </form>
          </div>

          <!-- Reset Password -->
          <div class="card p-5">
            <h3 class="font-semibold text-gray-800 mb-3">Reset Password</h3>
            <form @submit.prevent="resetPassword" class="space-y-3">
              <div>
                <label class="label">Password Baru</label>
                <input v-model="pwForm.password" type="password" class="input" required />
              </div>
              <div>
                <label class="label">Konfirmasi Password</label>
                <input v-model="pwForm.password_confirmation" type="password" class="input" required />
              </div>
              <button type="submit" class="btn-danger">Reset Password</button>
            </form>
          </div>
        </div>
      </div>

      <!-- Saldo History -->
      <div class="card overflow-hidden">
        <div class="p-4 border-b font-semibold text-gray-800">Riwayat Saldo</div>
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs text-gray-500">Waktu</th>
              <th class="px-4 py-2 text-left text-xs text-gray-500">Keterangan</th>
              <th class="px-4 py-2 text-right text-xs text-gray-500">Jumlah</th>
              <th class="px-4 py-2 text-right text-xs text-gray-500">Saldo Sesudah</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="h in saldoHistory" :key="h.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-gray-400 text-xs">{{ new Date(h.created_at).toLocaleString('id-ID') }}</td>
              <td class="px-4 py-2 text-gray-700">{{ h.description }}</td>
              <td class="px-4 py-2 text-right" :class="h.type === 'credit' ? 'text-green-600' : 'text-red-600'">
                {{ h.type === 'credit' ? '+' : '-' }}{{ formatRupiah(h.amount) }}
              </td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatRupiah(h.balance_after) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { reactive } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({ user: Object, saldoHistory: Array });

const roleForm  = reactive({ role: props.user.roles?.[0]?.name ?? 'user' });
const saldoForm = reactive({ type: 'credit', amount: '', description: '' });
const pwForm    = reactive({ password: '', password_confirmation: '' });

function assignRole()   { router.post(route('admin.users.assign-role', props.user.id), roleForm); }
function adjustSaldo()  { router.post(route('admin.users.adjust-saldo', props.user.id), saldoForm, { onSuccess: () => { saldoForm.amount = ''; saldoForm.description = ''; } }); }
function resetPassword(){ if (!confirm('Reset password user ini?')) return; router.post(route('admin.users.reset-password', props.user.id), pwForm); }
function formatRupiah(v){ return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
</script>
