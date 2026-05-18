<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <!-- Logo -->
          <Link href="/" class="flex items-center gap-2">
            <span class="text-2xl font-extrabold text-primary-600">Toya</span>
          </Link>

          <!-- Search (desktop) -->
          <div class="hidden md:flex flex-1 max-w-md mx-8">
            <div class="relative w-full">
              <input
                v-model="search"
                type="text"
                placeholder="Cari produk..."
                class="input pr-10"
                @keydown.enter="goSearch"
              />
              <button @click="goSearch" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                <MagnifyingGlassIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Nav Right -->
          <div class="flex items-center gap-3">
            <template v-if="$page.props.auth.user">
              <!-- Saldo -->
              <Link href="/saldo" class="hidden sm:flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600">
                <WalletIcon class="w-4 h-4" />
                <span class="font-medium">{{ formatRupiah($page.props.auth.user.saldo) }}</span>
              </Link>

              <!-- Notifications -->
              <button class="relative p-2 text-gray-500 hover:text-primary-600">
                <BellIcon class="w-5 h-5" />
                <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <!-- User Menu -->
              <div class="relative" ref="userMenuRef">
                <button @click="userMenuOpen = !userMenuOpen" class="flex items-center gap-2">
                  <img :src="$page.props.auth.user.avatar_url" class="w-8 h-8 rounded-full object-cover" :alt="$page.props.auth.user.name" />
                  <span class="hidden md:block text-sm font-medium text-gray-700">{{ $page.props.auth.user.name }}</span>
                  <ChevronDownIcon class="w-4 h-4 text-gray-500" />
                </button>

                <Transition enter-from-class="opacity-0 scale-95" enter-active-class="transition ease-out duration-100" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                  <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link href="/profil" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <UserIcon class="w-4 h-4" /> Profil Saya
                    </Link>
                    <Link href="/transaksi" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <ClipboardDocumentListIcon class="w-4 h-4" /> Transaksi
                    </Link>
                    <Link href="/saldo" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <WalletIcon class="w-4 h-4" /> Saldo
                    </Link>
                    <template v-if="$page.props.auth.user.is_admin">
                      <hr class="my-1 border-gray-100" />
                      <Link href="/admin" class="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium">
                        <Cog6ToothIcon class="w-4 h-4" /> Admin Panel
                      </Link>
                    </template>
                    <hr class="my-1 border-gray-100" />
                    <Link href="/logout" method="post" as="button" class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <ArrowRightOnRectangleIcon class="w-4 h-4" /> Keluar
                    </Link>
                  </div>
                </Transition>
              </div>
            </template>

            <template v-else>
              <Link href="/login" class="btn-secondary text-sm px-4 py-2">Masuk</Link>
              <Link href="/register" class="btn-primary text-sm px-4 py-2">Daftar</Link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Flash Messages -->
    <div v-if="$page.props.flash.success || $page.props.flash.error" class="fixed top-20 right-4 z-50 space-y-2">
      <div v-if="$page.props.flash.success" class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow text-sm flex items-center gap-2">
        <CheckCircleIcon class="w-4 h-4 text-green-500 flex-shrink-0" />
        {{ $page.props.flash.success }}
      </div>
      <div v-if="$page.props.flash.error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow text-sm flex items-center gap-2">
        <XCircleIcon class="w-4 h-4 text-red-500 flex-shrink-0" />
        {{ $page.props.flash.error }}
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="md:col-span-2">
            <span class="text-2xl font-extrabold text-white">Toya</span>
            <p class="mt-2 text-sm leading-6">Platform Top Up dan PPOB digital terpercaya di Indonesia. Proses instan, aman, dan terjangkau.</p>
            <div class="mt-4 flex gap-3">
              <span class="badge badge-info text-xs">Midtrans Verified</span>
              <span class="badge badge-success text-xs">Digiflazz Partner</span>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-white mb-3">Produk</h3>
            <ul class="space-y-2 text-sm">
              <li><Link href="/kategori/game-top-up" class="hover:text-white transition-colors">Game Top Up</Link></li>
              <li><Link href="/kategori/pulsa" class="hover:text-white transition-colors">Pulsa</Link></li>
              <li><Link href="/kategori/paket-data" class="hover:text-white transition-colors">Paket Data</Link></li>
              <li><Link href="/kategori/token-listrik" class="hover:text-white transition-colors">Token Listrik</Link></li>
              <li><Link href="/kategori/bpjs-kesehatan" class="hover:text-white transition-colors">BPJS</Link></li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-white mb-3">Bantuan</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#faq" class="hover:text-white transition-colors">FAQ</a></li>
              <li><Link href="/transaksi" class="hover:text-white transition-colors">Cek Transaksi</Link></li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          © {{ new Date().getFullYear() }} Toya. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { onClickOutside } from '@vueuse/core';
import {
  MagnifyingGlassIcon, BellIcon, ChevronDownIcon,
  UserIcon, ClipboardDocumentListIcon, WalletIcon,
  Cog6ToothIcon, ArrowRightOnRectangleIcon,
  CheckCircleIcon, XCircleIcon,
} from '@heroicons/vue/24/outline';

const search = ref('');
const userMenuOpen = ref(false);
const unreadCount = ref(0);
const userMenuRef = ref(null);

onClickOutside(userMenuRef, () => { userMenuOpen.value = false; });

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function goSearch() {
  if (search.value.trim()) {
    router.visit(`/?search=${encodeURIComponent(search.value)}`);
  }
}
</script>
