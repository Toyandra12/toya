<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Kategori</h1>
        <button @click="openModal()" class="btn-primary">+ Tambah Kategori</button>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tipe</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Brand</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Produk</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="cat in categories.data" :key="cat.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800">{{ cat.icon }} {{ cat.name }}</td>
              <td class="px-4 py-3">
                <span class="badge badge-info">{{ cat.type }}</span>
              </td>
              <td class="px-4 py-3 text-center text-gray-600">{{ cat.brands_count }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ cat.products_count }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="cat.is_active ? 'badge-success' : 'badge-danger'" class="badge">{{ cat.is_active ? 'Aktif' : 'Nonaktif' }}</span>
              </td>
              <td class="px-4 py-3 text-center flex justify-center gap-2">
                <button @click="openModal(cat)" class="text-primary-600 hover:text-primary-700 text-xs font-medium">Edit</button>
                <button @click="destroy(cat)" class="text-red-500 hover:text-red-700 text-xs font-medium">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
          <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-900">{{ editing ? 'Edit' : 'Tambah' }} Kategori</h2>
            <button @click="modal = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <form @submit.prevent="submit" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Nama</label>
                <input v-model="form.name" type="text" class="input" required />
              </div>
              <div>
                <label class="label">Icon (emoji)</label>
                <input v-model="form.icon" type="text" class="input" placeholder="🎮" />
              </div>
            </div>
            <div>
              <label class="label">Tipe</label>
              <select v-model="form.type" class="input">
                <option value="digital">Digital</option>
                <option value="game">Game</option>
                <option value="ppob">PPOB</option>
              </select>
            </div>
            <div>
              <label class="label">Deskripsi</label>
              <textarea v-model="form.description" rows="2" class="input resize-none"></textarea>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="label">Urutan</label>
                <input v-model="form.sort_order" type="number" class="input" />
              </div>
              <div class="flex items-end pb-1">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="form.is_active" type="checkbox" class="rounded" />
                  <span class="text-sm text-gray-700">Aktif</span>
                </label>
              </div>
              <div class="flex items-end pb-1">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="form.is_featured" type="checkbox" class="rounded" />
                  <span class="text-sm text-gray-700">Featured</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="modal = false" class="btn-secondary">Batal</button>
              <button type="submit" class="btn-primary">{{ editing ? 'Simpan' : 'Tambah' }}</button>
            </div>
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

const props = defineProps({ categories: Object });

const modal   = ref(false);
const editing = ref(null);
const form    = reactive({ name: '', icon: '', type: 'digital', description: '', sort_order: 0, is_active: true, is_featured: false });

function openModal(cat = null) {
  editing.value = cat;
  if (cat) {
    Object.assign(form, { name: cat.name, icon: cat.icon ?? '', type: cat.type, description: cat.description ?? '', sort_order: cat.sort_order, is_active: cat.is_active, is_featured: cat.is_featured });
  } else {
    Object.assign(form, { name: '', icon: '', type: 'digital', description: '', sort_order: 0, is_active: true, is_featured: false });
  }
  modal.value = true;
}

function submit() {
  if (editing.value) {
    router.put(route('admin.categories.update', editing.value.id), form, { onSuccess: () => { modal.value = false; } });
  } else {
    router.post(route('admin.categories.store'), form, { onSuccess: () => { modal.value = false; } });
  }
}

function destroy(cat) {
  if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
  router.delete(route('admin.categories.destroy', cat.id));
}
</script>
