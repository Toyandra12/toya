<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <aside :class="['fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-gray-900 transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'lg:translate-x-0 lg:static lg:inset-auto']">
      <div class="flex items-center justify-between h-16 px-6 border-b border-gray-700">
        <Link href="/" class="text-xl font-extrabold text-white">🏪 Toya</Link>
        <button @click="sidebarOpen = false" class="lg:hidden text-gray-400 hover:text-white">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <NavItem :href="route('admin.dashboard')" icon="ChartPieIcon">Dashboard</NavItem>
        <NavItem :href="route('admin.analytics')" icon="ChartBarIcon">Analitik</NavItem>

        <div class="pt-4 pb-1 px-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Katalog</span>
        </div>
        <NavItem :href="route('admin.categories.index')" icon="TagIcon">Kategori</NavItem>
        <NavItem :href="route('admin.brands.index')" icon="BuildingStorefrontIcon">Brand</NavItem>
        <NavItem :href="route('admin.products.index')" icon="CubeIcon">Produk</NavItem>

        <div class="pt-4 pb-1 px-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaksi</span>
        </div>
        <NavItem :href="route('admin.transactions.index')" icon="CreditCardIcon">Transaksi</NavItem>
        <NavItem :href="route('admin.saldo-topups.index')" icon="BanknotesIcon">Top Up Saldo</NavItem>

        <div class="pt-4 pb-1 px-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Konten</span>
        </div>
        <NavItem :href="route('admin.sliders.index')" icon="PhotoIcon">Slider</NavItem>
        <NavItem :href="route('admin.faqs.index')" icon="QuestionMarkCircleIcon">FAQ</NavItem>
        <NavItem :href="route('admin.notifications.index')" icon="BellIcon">Notifikasi</NavItem>

        <div class="pt-4 pb-1 px-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Manajemen</span>
        </div>
        <NavItem :href="route('admin.users.index')" icon="UsersIcon">Users</NavItem>
        <NavItem :href="route('admin.roles.index')" icon="ShieldCheckIcon">Roles</NavItem>

        <div class="pt-4 pb-1 px-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Laporan</span>
        </div>
        <NavItem :href="route('admin.reports.transactions')" icon="DocumentTextIcon">Lap. Transaksi</NavItem>
        <NavItem :href="route('admin.reports.revenue')" icon="PresentationChartLineIcon">Lap. Pendapatan</NavItem>
      </nav>

      <!-- User Info -->
      <div class="p-4 border-t border-gray-700">
        <div class="flex items-center gap-3">
          <img :src="$page.props.auth.user?.avatar_url" class="w-9 h-9 rounded-full object-cover" alt="Avatar" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ $page.props.auth.user?.name }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ $page.props.auth.user?.roles?.[0] }}</p>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <Link href="/" class="flex-1 text-center py-1.5 text-xs text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors">Storefront</Link>
          <Link href="/logout" method="post" as="button" class="flex-1 text-center py-1.5 text-xs text-red-400 hover:text-red-300 border border-gray-600 rounded-lg transition-colors">Keluar</Link>
        </div>
      </div>
    </aside>

    <!-- Overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar -->
      <header class="bg-white shadow-sm h-16 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30">
        <button @click="sidebarOpen = true" class="lg:hidden text-gray-500 hover:text-gray-700">
          <Bars3Icon class="w-6 h-6" />
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-semibold text-gray-800">{{ $page.props.pageTitle ?? 'Admin Panel' }}</h1>
        </div>
        <!-- Flash -->
        <div v-if="$page.props.flash.success" class="hidden sm:flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
          <CheckCircleIcon class="w-4 h-4" />{{ $page.props.flash.success }}
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import {
  XMarkIcon, Bars3Icon, CheckCircleIcon,
  ChartPieIcon, ChartBarIcon, TagIcon, BuildingStorefrontIcon,
  CubeIcon, CreditCardIcon, BanknotesIcon, PhotoIcon,
  QuestionMarkCircleIcon, BellIcon, UsersIcon, ShieldCheckIcon,
  DocumentTextIcon, PresentationChartLineIcon,
} from '@heroicons/vue/24/outline';

const sidebarOpen = ref(false);

// NavItem component inline
const NavItem = {
  props: ['href', 'icon'],
  template: `
    <Link :href="href" :class="['flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150',
      $page.url.startsWith(href.replace(window.location.origin,'')) ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']">
      <slot />
    </Link>
  `,
};
</script>
