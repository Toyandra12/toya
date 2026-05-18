<template>
  <AdminLayout>
    <div class="space-y-5">
      <h1 class="text-xl font-bold text-gray-900">Manajemen User</h1>

      <!-- Filters -->
      <div class="card p-4 flex gap-3 flex-wrap">
        <input v-model="f.search" type="text" placeholder="Cari nama / email..." class="input flex-1 min-w-48" @keydown.enter="apply" />
        <select v-model="f.role" class="input w-36" @change="apply">
          <option value="">Semua Role</option>
          <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.name }}</option>
        </select>
        <button @click="apply" class="btn-primary">Cari</button>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">User</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Saldo</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Transaksi</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Role</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="user in users.data" :key="user.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="user.avatar_url" class="w-8 h-8 rounded-full object-cover" :alt="user.name" />
                  <div>
                    <p class="font-medium text-gray-800">{{ user.name }}</p>
                    <p class="text-xs text-gray-400">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 font-medium text-gray-900">{{ formatRupiah(user.saldo) }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ user.transactions_count }}</td>
              <td class="px-4 py-3 text-center">
                <span class="badge badge-info capitalize">{{ user.roles?.[0]?.name ?? 'user' }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="user.is_active ? 'badge-success' : 'badge-danger'" class="badge">{{ user.is_active ? 'Aktif' : 'Nonaktif' }}</span>
              </td>
              <td class="px-4 py-3 text-center flex justify-center gap-2">
                <Link :href="route('admin.users.show', user.id)" class="text-primary-600 text-xs font-medium">Detail</Link>
                <button @click="toggleActive(user)" class="text-yellow-600 text-xs font-medium">{{ user.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
              </td>
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

const props = defineProps({ users: Object, roles: Array, filters: Object });
const f = reactive({ search: props.filters?.search ?? '', role: props.filters?.role ?? '' });

function apply() { router.get(route('admin.users.index'), f, { preserveState: true, replace: true }); }
function toggleActive(user) {
  if (!confirm(`${user.is_active ? 'Nonaktifkan' : 'Aktifkan'} user "${user.name}"?`)) return;
  router.post(route('admin.users.toggle-active', user.id));
}
function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
</script>
