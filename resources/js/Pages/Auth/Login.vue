<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <Link href="/" class="text-4xl font-extrabold text-white">Toya</Link>
        <p class="text-primary-200 mt-2 text-sm">Platform Top Up & PPOB Digital Indonesia</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Masuk ke Akun</h1>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" type="email" placeholder="email@contoh.com" class="input" required />
            <p v-if="$page.props.errors?.email" class="text-red-500 text-xs mt-1">{{ $page.props.errors.email }}</p>
          </div>
          <div>
            <label class="label">Password</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Password" class="input pr-10" required />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon v-if="!showPassword" class="w-4 h-4" />
                <EyeSlashIcon v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="flex items-center">
            <input v-model="form.remember" id="remember" type="checkbox" class="rounded border-gray-300 text-primary-600 mr-2" />
            <label for="remember" class="text-sm text-gray-600">Ingat saya</label>
          </div>
          <button type="submit" :disabled="loading" class="btn-primary w-full py-2.5">
            <span v-if="loading" class="animate-spin mr-2">⟳</span>
            Masuk
          </button>
        </form>

        <p class="text-center text-sm text-gray-600 mt-6">
          Belum punya akun?
          <Link href="/register" class="text-primary-600 font-medium hover:text-primary-700">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Link, useForm } from '@inertiajs/vue3';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const loading = ref(false);
const showPassword = ref(false);

const form = useForm({ email: '', password: '', remember: false });

function submit() {
  loading.value = true;
  form.post('/login', {
    onFinish: () => { loading.value = false; },
  });
}
</script>
