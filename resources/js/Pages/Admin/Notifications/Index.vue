<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Notifikasi Push</h1>
        <button @click="modal = true" class="btn-primary">+ Kirim Notifikasi</button>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Judul</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Target</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Waktu</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="n in notifications.data" :key="n.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ n.title }}</p>
                <p class="text-xs text-gray-400 truncate max-w-xs">{{ n.body }}</p>
              </td>
              <td class="px-4 py-3"><span class="badge badge-info">{{ n.target }}</span></td>
              <td class="px-4 py-3 text-center"><span :class="n.is_sent ? 'badge-success' : 'badge-warning'" class="badge">{{ n.is_sent ? 'Terkirim' : 'Draft' }}</span></td>
              <td class="px-4 py-3 text-center text-xs text-gray-400">{{ n.sent_at ? new Date(n.sent_at).toLocaleString('id-ID') : '-' }}</td>
              <td class="px-4 py-3 text-center"><button @click="destroy(n)" class="text-red-500 text-xs font-medium">Hapus</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div class="p-6 border-b flex justify-between"><h2 class="text-lg font-bold">Kirim Notifikasi</h2><button @click="modal=false">✕</button></div>
          <form @submit.prevent="submit" class="p-6 space-y-4">
            <div><label class="label">Judul</label><input v-model="form.title" type="text" class="input" required /></div>
            <div><label class="label">Isi Pesan</label><textarea v-model="form.body" rows="3" class="input resize-none" required></textarea></div>
            <div><label class="label">Link (opsional)</label><input v-model="form.link" type="text" class="input" placeholder="https://..." /></div>
            <div>
              <label class="label">Target</label>
              <select v-model="form.target" class="input">
                <option value="all">Semua User</option>
                <option value="role">Berdasarkan Role</option>
              </select>
            </div>
            <div class="flex justify-end gap-3"><button type="button" @click="modal=false" class="btn-secondary">Batal</button><button type="submit" class="btn-primary">Kirim</button></div>
          </form>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({ notifications: Object });
const modal = ref(false);
const form  = reactive({ title: '', body: '', link: '', target: 'all' });

function submit() { router.post(route('admin.notifications.store'), form, { onSuccess: () => { modal.value = false; Object.assign(form, { title: '', body: '', link: '', target: 'all' }); } }); }
function destroy(n) { if (!confirm('Hapus notifikasi ini?')) return; router.delete(route('admin.notifications.destroy', n.id)); }
</script>
