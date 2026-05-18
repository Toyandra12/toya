<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">FAQ</h1>
        <button @click="openModal()" class="btn-primary">+ Tambah FAQ</button>
      </div>
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Pertanyaan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Kategori</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="faq in faqs.data" :key="faq.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-800 max-w-xs truncate">{{ faq.question }}</td>
              <td class="px-4 py-3"><span class="badge badge-info">{{ faq.category }}</span></td>
              <td class="px-4 py-3 text-center"><span :class="faq.is_active ? 'badge-success' : 'badge-danger'" class="badge">{{ faq.is_active ? 'Aktif' : 'Nonaktif' }}</span></td>
              <td class="px-4 py-3 text-center flex justify-center gap-2">
                <button @click="openModal(faq)" class="text-primary-600 text-xs font-medium">Edit</button>
                <button @click="destroy(faq)" class="text-red-500 text-xs font-medium">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
          <div class="p-6 border-b flex justify-between"><h2 class="text-lg font-bold">{{ editing ? 'Edit' : 'Tambah' }} FAQ</h2><button @click="modal=false">✕</button></div>
          <form @submit.prevent="submit" class="p-6 space-y-4">
            <div><label class="label">Pertanyaan</label><input v-model="form.question" type="text" class="input" required /></div>
            <div><label class="label">Jawaban</label><textarea v-model="form.answer" rows="4" class="input resize-none" required></textarea></div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Kategori</label>
                <select v-model="form.category" class="input">
                  <option value="general">General</option>
                  <option value="payment">Pembayaran</option>
                  <option value="topup">Top Up</option>
                  <option value="account">Akun</option>
                </select>
              </div>
              <div><label class="label">Urutan</label><input v-model="form.sort_order" type="number" class="input" /></div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer"><input v-model="form.is_active" type="checkbox" class="rounded" /><span class="text-sm text-gray-700">Aktif</span></label>
            <div class="flex justify-end gap-3"><button type="button" @click="modal=false" class="btn-secondary">Batal</button><button type="submit" class="btn-primary">Simpan</button></div>
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

const props = defineProps({ faqs: Object });
const modal = ref(false);
const editing = ref(null);
const form = reactive({ question: '', answer: '', category: 'general', sort_order: 0, is_active: true });

function openModal(faq = null) {
  editing.value = faq;
  Object.assign(form, faq ? { question: faq.question, answer: faq.answer, category: faq.category, sort_order: faq.sort_order, is_active: faq.is_active } : { question: '', answer: '', category: 'general', sort_order: 0, is_active: true });
  modal.value = true;
}

function submit() {
  const opts = { onSuccess: () => { modal.value = false; } };
  editing.value ? router.put(route('admin.faqs.update', editing.value.id), form, opts) : router.post(route('admin.faqs.store'), form, opts);
}

function destroy(faq) {
  if (!confirm('Hapus FAQ ini?')) return;
  router.delete(route('admin.faqs.destroy', faq.id));
}
</script>
