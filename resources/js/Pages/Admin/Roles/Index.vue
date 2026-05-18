<template>
  <AdminLayout>
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Manajemen Role</h1>
        <button @click="openModal()" class="btn-primary">+ Tambah Role</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="role in roles" :key="role.id" class="card p-5">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-bold text-gray-900 capitalize">{{ role.name }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ role.users_count }} pengguna</p>
            </div>
            <div v-if="!['super-admin','admin','user'].includes(role.name)" class="flex gap-2">
              <button @click="openModal(role)" class="text-primary-600 text-xs font-medium">Edit</button>
              <button @click="destroy(role)" class="text-red-500 text-xs font-medium">Hapus</button>
            </div>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="perm in role.permissions?.slice(0,6)" :key="perm.id" class="badge badge-gray text-xs">{{ perm.name }}</span>
            <span v-if="role.permissions?.length > 6" class="badge badge-gray text-xs">+{{ role.permissions.length - 6 }} lainnya</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl w-full max-w-xl shadow-2xl my-4">
          <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-lg font-bold">{{ editing ? 'Edit' : 'Tambah' }} Role</h2>
            <button @click="modal = false">✕</button>
          </div>
          <form @submit.prevent="submit" class="p-6 space-y-4">
            <div>
              <label class="label">Nama Role</label>
              <input v-model="form.name" type="text" class="input" required />
            </div>
            <div>
              <label class="label mb-2">Permissions</label>
              <div class="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">
                <label v-for="perm in permissions" :key="perm.id" class="flex items-center gap-2 text-sm cursor-pointer">
                  <input v-model="form.permissions" type="checkbox" :value="perm.name" class="rounded" />
                  <span class="text-gray-700">{{ perm.name }}</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="modal = false" class="btn-secondary">Batal</button>
              <button type="submit" class="btn-primary">Simpan</button>
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

const props = defineProps({ roles: Array, permissions: Array });

const modal   = ref(false);
const editing = ref(null);
const form    = reactive({ name: '', permissions: [] });

function openModal(role = null) {
  editing.value = role;
  form.name = role?.name ?? '';
  form.permissions = role?.permissions?.map(p => p.name) ?? [];
  modal.value = true;
}

function submit() {
  if (editing.value) {
    router.put(route('admin.roles.update', editing.value.id), form, { onSuccess: () => { modal.value = false; } });
  } else {
    router.post(route('admin.roles.store'), form, { onSuccess: () => { modal.value = false; } });
  }
}

function destroy(role) {
  if (!confirm(`Hapus role "${role.name}"?`)) return;
  router.delete(route('admin.roles.destroy', role.id));
}
</script>
