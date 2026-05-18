<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Slider / Banner</h1>
        <button @click="openModal()" class="btn-primary">+ Tambah Slider</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="s in sliders.data" :key="s.id" class="card overflow-hidden">
          <div class="h-32 bg-gradient-to-r from-primary-600 to-primary-800 flex items-center px-4">
            <div>
              <p v-if="s.badge" class="text-xs font-bold text-yellow-300 mb-1">{{ s.badge }}</p>
              <p class="text-white font-bold text-sm">{{ s.title }}</p>
              <p class="text-primary-200 text-xs">{{ s.subtitle }}</p>
            </div>
          </div>
          <div class="p-4 flex items-center justify-between">
            <span :class="s.is_active ? 'badge-success' : 'badge-danger'" class="badge">{{ s.is_active ? 'Aktif' : 'Nonaktif' }}</span>
            <div class="flex gap-2">
              <button @click="openModal(s)" class="text-primary-600 text-xs font-medium">Edit</button>
              <button @click="destroy(s)" class="text-red-500 text-xs font-medium">Hapus</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
          <div class="p-6 border-b flex justify-between"><h2 class="text-lg font-bold">{{ editing ? 'Edit' : 'Tambah' }} Slider</h2><button @click="modal=false">✕</button></div>
          <form @submit.prevent="submit" class="p-6 space-y-4">
            <div><label class="label">Judul</label><input v-model="form.title" type="text" class="input" required /></div>
            <div><label class="label">Subjudul</label><input v-model="form.subtitle" type="text" class="input" /></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Link</label><input v-model="form.link" type="text" class="input" /></div>
              <div><label class="label">Teks Tombol</label><input v-model="form.button_text" type="text" class="input" /></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Badge</label><input v-model="form.badge" type="text" class="input" /></div>
              <div><label class="label">Urutan</label><input v-model="form.sort_order" type="number" class="input" /></div>
            </div>
            <div v-if="!editing">
              <label class="label">Gambar <span class="text-red-500">*</span></label>
              <input type="file" ref="imageInput" accept="image/*" class="input" :required="!editing" />
            </div>
            <div v-else>
              <label class="label">Gambar Baru (opsional)</label>
              <input type="file" ref="imageInput" accept="image/*" class="input" />
            </div>
            <label class="flex items-center gap-2 cursor-pointer"><input v-model="form.is_active" type="checkbox" class="rounded" /><span class="text-sm">Aktif</span></label>
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

const props = defineProps({ sliders: Object });
const modal = ref(false);
const editing = ref(null);
const imageInput = ref(null);
const form = reactive({ title: '', subtitle: '', link: '', button_text: '', badge: '', sort_order: 0, is_active: true });

function openModal(s = null) {
  editing.value = s;
  Object.assign(form, s ? { title: s.title, subtitle: s.subtitle ?? '', link: s.link ?? '', button_text: s.button_text ?? '', badge: s.badge ?? '', sort_order: s.sort_order, is_active: s.is_active }
    : { title: '', subtitle: '', link: '', button_text: '', badge: '', sort_order: 0, is_active: true });
  modal.value = true;
}

function submit() {
  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
  if (imageInput.value?.files[0]) fd.append('image', imageInput.value.files[0]);
  const opts = { onSuccess: () => { modal.value = false; } };
  editing.value
    ? router.post(route('admin.sliders.update', editing.value.id), { ...Object.fromEntries(fd), _method: 'PUT' }, opts)
    : router.post(route('admin.sliders.store'), fd, opts);
}

function destroy(s) {
  if (!confirm(`Hapus slider "${s.title}"?`)) return;
  router.delete(route('admin.sliders.destroy', s.id));
}
</script>
