<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Brand</h1>
        <button @click="openModal()" class="btn-primary">+ Tambah Brand</button>
      </div>

      <div class="card p-4 flex gap-3">
        <select v-model="f.category_id" class="input w-48" @change="apply">
          <option value="">Semua Kategori</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <button @click="apply" class="btn-primary">Filter</button>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Brand</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Kategori</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Produk</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="brand in brands.data" :key="brand.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ brand.name }}</p>
                <p class="text-xs text-gray-400">{{ brand.slug }}</p>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ brand.category?.name }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ brand.products_count }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="brand.is_active ? 'badge-success' : 'badge-danger'" class="badge">{{ brand.is_active ? 'Aktif' : 'Nonaktif' }}</span>
              </td>
              <td class="px-4 py-3 text-center flex justify-center gap-2">
                <button @click="openModal(brand)" class="text-primary-600 text-xs font-medium">Edit</button>
                <button @click="destroy(brand)" class="text-red-500 text-xs font-medium">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
          <div class="p-6 border-b flex justify-between"><h2 class="text-lg font-bold">{{ editing ? 'Edit' : 'Tambah' }} Brand</h2><button @click="modal=false">✕</button></div>
          <form @submit.prevent="submit" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div><label class="label">Kategori</label>
                <select v-model="form.category_id" class="input" required>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div><label class="label">Nama</label><input v-model="form.name" type="text" class="input" required /></div>
            </div>
            <div><label class="label">Game Code (untuk game)</label><input v-model="form.game_code" type="text" class="input" placeholder="mobilelegends" /></div>
            <div><label class="label">Deskripsi</label><textarea v-model="form.description" rows="2" class="input resize-none"></textarea></div>
            <div class="grid grid-cols-3 gap-3">
              <div><label class="label">Urutan</label><input v-model="form.sort_order" type="number" class="input" /></div>
              <div class="flex items-end pb-1"><label class="flex items-center gap-2 cursor-pointer"><input v-model="form.is_active" type="checkbox" class="rounded" /><span class="text-sm">Aktif</span></label></div>
              <div class="flex items-end pb-1"><label class="flex items-center gap-2 cursor-pointer"><input v-model="form.is_featured" type="checkbox" class="rounded" /><span class="text-sm">Featured</span></label></div>
            </div>
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

const props = defineProps({ brands: Object, categories: Array });
const modal = ref(false);
const editing = ref(null);
const f = reactive({ category_id: '' });
const form = reactive({ category_id: '', name: '', game_code: '', description: '', sort_order: 0, is_active: true, is_featured: false });

function apply() { router.get(route('admin.brands.index'), f, { preserveState: true, replace: true }); }

function openModal(brand = null) {
  editing.value = brand;
  Object.assign(form, brand ? { category_id: brand.category_id, name: brand.name, game_code: brand.game_code ?? '', description: brand.description ?? '', sort_order: brand.sort_order, is_active: brand.is_active, is_featured: brand.is_featured }
    : { category_id: '', name: '', game_code: '', description: '', sort_order: 0, is_active: true, is_featured: false });
  modal.value = true;
}

function submit() {
  const opts = { onSuccess: () => { modal.value = false; } };
  editing.value ? router.put(route('admin.brands.update', editing.value.id), form, opts) : router.post(route('admin.brands.store'), form, opts);
}

function destroy(brand) {
  if (!confirm(`Hapus brand "${brand.name}"?`)) return;
  router.delete(route('admin.brands.destroy', brand.id));
}
</script>
