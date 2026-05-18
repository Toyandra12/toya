<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 class="text-xl font-bold text-gray-900">Profil Saya</h1>

      <!-- Avatar + Saldo -->
      <div class="card p-6 flex items-center gap-5">
        <div class="relative">
          <img :src="user.avatar_url" class="w-20 h-20 rounded-full object-cover" :alt="user.name" />
          <label class="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700">
            <CameraIcon class="w-3.5 h-3.5 text-white" />
            <input type="file" accept="image/*" class="hidden" @change="uploadAvatar" />
          </label>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold text-gray-900">{{ user.name }}</h2>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
          <p class="text-xs text-gray-400 mt-1">Kode Referral: <span class="font-mono font-semibold text-primary-600">{{ user.referral_code }}</span></p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-primary-600">{{ formatRupiah(user.saldo) }}</p>
          <p class="text-xs text-gray-400">Saldo Akun</p>
          <Link href="/saldo" class="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 inline-block">Top Up →</Link>
        </div>
      </div>

      <!-- Edit Profile -->
      <div class="card p-6">
        <h2 class="font-semibold text-gray-800 mb-4">Edit Profil</h2>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div><label class="label">Nama Lengkap</label><input v-model="profileForm.name" type="text" class="input" required /></div>
            <div><label class="label">Nomor HP</label><input v-model="profileForm.phone" type="tel" class="input" /></div>
          </div>
          <div><label class="label">Email</label><input v-model="profileForm.email" type="email" class="input" required /></div>
          <button type="submit" class="btn-primary">Simpan Perubahan</button>
        </form>
      </div>

      <!-- Change Password -->
      <div class="card p-6">
        <h2 class="font-semibold text-gray-800 mb-4">Ubah Password</h2>
        <form @submit.prevent="updatePassword" class="space-y-4">
          <div><label class="label">Password Saat Ini</label><input v-model="pwForm.current_password" type="password" class="input" required /></div>
          <div><label class="label">Password Baru</label><input v-model="pwForm.password" type="password" class="input" required /></div>
          <div><label class="label">Konfirmasi Password Baru</label><input v-model="pwForm.password_confirmation" type="password" class="input" required /></div>
          <button type="submit" class="btn-primary">Ubah Password</button>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { reactive } from 'vue';
import { Link, router, useForm } from '@inertiajs/vue3';
import { CameraIcon } from '@heroicons/vue/24/outline';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({ user: Object });

const profileForm = reactive({ name: props.user.name, email: props.user.email, phone: props.user.phone ?? '' });
const pwForm = useForm({ current_password: '', password: '', password_confirmation: '' });

function updateProfile() { router.put('/profil', profileForm); }
function updatePassword() { pwForm.put('/profil/password', { onSuccess: () => pwForm.reset() }); }

function uploadAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('avatar', file);
  router.post('/profil/avatar', fd);
}

function formatRupiah(v) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0); }
</script>
