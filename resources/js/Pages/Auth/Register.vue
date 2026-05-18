<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 px-4 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <Link href="/" class="text-4xl font-extrabold text-white">Toya</Link>
        <p class="text-primary-200 mt-2 text-sm">Platform Top Up & PPOB Digital Indonesia</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Buat Akun Baru</h1>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="label">Nama Lengkap</label>
            <input v-model="form.name" type="text" placeholder="Nama lengkap" class="input" required />
            <p v-if="$page.props.errors?.name" class="text-red-500 text-xs mt-1">{{ $page.props.errors.name }}</p>
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" type="email" placeholder="email@contoh.com" class="input" required />
            <p v-if="$page.props.errors?.email" class="text-red-500 text-xs mt-1">{{ $page.props.errors.email }}</p>
          </div>
          <div>
            <label class="label">Nomor HP (opsional)</label>
            <input v-model="form.phone" type="tel" placeholder="08xx..." class="input" />
          </div>
          <div>
            <label class="label">Password</label>
            <input v-model="form.password" type="password" placeholder="Minimal 8 karakter" class="input" required />
            <p v-if="$page.props.errors?.password" class="text-red-500 text-xs mt-1">{{ $page.props.errors.password }}</p>
          </div>
          <div>
            <label class="label">Konfirmasi Password</label>
            <input v-model="form.password_confirmation" type="password" placeholder="Ulangi password" class="input" required />
          </div>
          <div>
            <label class="label">Kode Referral (opsional)</label>
            <input v-model="form.referral_code" type="text" placeholder="Kode referral teman" class="input uppercase" />
          </div>
          <button type="submit" :disabled="loading" class="btn-primary w-full py-2.5">
            <span v-if="loading" class="animate-spin mr-2">⟳</span>
            Daftar Sekarang
          </button>
        </form>

        <p class="text-center text-sm text-gray-600 mt-6">
          Sudah punya akun?
          <Link href="/login" class="text-primary-600 font-medium hover:text-primary-700">Masuk</Link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Link, useForm } from '@inertiajs/vue3';

const loading = ref(false);
const form = useForm({ name: '', email: '', phone: '', password: '', password_confirmation: '', referral_code: '' });

function submit() {
  loading.value = true;
  form.post('/register', { onFinish: () => { loading.value = false; } });
}
</script>
