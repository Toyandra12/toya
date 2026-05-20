<script setup>
/**
 * Primary navigation region (UI guidelines §4.6).
 * - Skip link is the first focus stop.
 * - Mobile drawer traps focus and closes on Esc / outside click.
 * - All links use AppLink; cart is icon-only AppButton with aria-label.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Link, usePage, router } from '@inertiajs/vue3'
import AppLink from '@/Components/UI/AppLink.vue'
import AppButton from '@/Components/UI/AppButton.vue'

const page = usePage()
const auth = computed(() => page.props.auth?.user || null)

const NAV_LINKS = [
    { label: 'Beranda',     href: '/' },
    { label: 'Game',        href: '/kategori/game' },
    { label: 'Pulsa',       href: '/kategori/pulsa' },
    { label: 'Paket Data',  href: '/kategori/paket-data' },
    { label: 'PPOB',        href: '/kategori/ppob' },
    { label: 'Voucher',     href: '/kategori/voucher' },
]

const search = ref('')
function submitSearch() {
    if (!search.value.trim()) return
    router.visit(`/kategori/game?q=${encodeURIComponent(search.value)}`)
}

const currentPath = computed(() => page.url || '/')
function isCurrent(href) {
    if (href === '/') return currentPath.value === '/'
    return currentPath.value.startsWith(href)
}

// ── Mobile drawer ───────────────────────────────────────────────────────────
const drawerOpen = ref(false)
const drawerRef  = ref(null)
const triggerRef = ref(null)

function openDrawer() {
    drawerOpen.value = true
    nextTick(() => {
        const first = drawerRef.value?.querySelector('a, button, input')
        first?.focus()
    })
}

function closeDrawer() {
    drawerOpen.value = false
    nextTick(() => triggerRef.value?.focus())
}

function onKey(e) {
    if (!drawerOpen.value) return
    if (e.key === 'Escape') {
        closeDrawer()
        return
    }
    // Focus trap
    if (e.key === 'Tab') {
        const focusables = drawerRef.value?.querySelectorAll(
            'a, button, input, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables?.length) return
        const first = focusables[0]
        const last  = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus()
        }
    }
}

// Close drawer on route change
const stopRouteListener = router.on('navigate', () => { drawerOpen.value = false })

onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKey)
    stopRouteListener()
})

watch(drawerOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
    <header
        class="sticky top-0 z-40 bg-surface-strong border-b border-surface-muted"
        role="banner"
    >
        <a href="#main-content" class="skip-link">Lewati ke konten utama</a>

        <div class="site-container flex items-center justify-between gap-4 h-16">
            <!-- Brand -->
            <Link
                href="/"
                class="flex items-center gap-t5 text-fg-primary font-bold text-2xl tracking-tight"
                aria-label="CINENOVA — Beranda"
            >
                <span
                    class="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-fg-tertiary"
                    aria-hidden="true"
                >
                    <span class="text-fg-primary font-extrabold">C</span>
                </span>
                <span>CINENOVA</span>
            </Link>

            <!-- Primary nav (desktop) -->
            <nav
                class="hidden lg:flex items-center gap-2"
                aria-label="Navigasi utama"
            >
                <AppLink
                    v-for="link in NAV_LINKS"
                    :key="link.href"
                    :href="link.href"
                    variant="standalone"
                    :current="isCurrent(link.href)"
                    class="px-3 py-2 text-md"
                >
                    {{ link.label }}
                </AppLink>
            </nav>

            <!-- Search (desktop) -->
            <form
                class="hidden md:flex items-center flex-1 max-w-xs"
                role="search"
                aria-label="Cari produk"
                @submit.prevent="submitSearch"
            >
                <label for="header-search" class="vh">Cari produk</label>
                <input
                    id="header-search"
                    v-model="search"
                    type="search"
                    placeholder="Cari game, pulsa, voucher…"
                    autocomplete="off"
                    class="block w-full h-11 px-4 text-md text-fg-primary bg-surface-raised border border-fg-inverse rounded-xs placeholder:text-fg-inverse hover:border-fg-secondary focus:outline-none focus:border-fg-tertiary focus:shadow-t2 transition-colors duration-base"
                />
            </form>

            <!-- Account + Cart + Hamburger -->
            <div class="flex items-center gap-t7">
                <template v-if="auth">
                    <AppLink
                        href="/saldo"
                        variant="standalone"
                        class="hidden md:inline-flex items-center px-3 py-2 text-md"
                    >
                        Saldo
                    </AppLink>
                    <AppLink
                        href="/profil"
                        variant="standalone"
                        class="hidden md:inline-flex items-center px-3 py-2 text-md"
                    >
                        {{ auth.name?.split(' ')[0] || 'Akun' }}
                    </AppLink>
                </template>
                <template v-else>
                    <AppButton
                        href="/login"
                        variant="ghost"
                        size="sm"
                        class="hidden md:inline-flex"
                    >
                        Masuk
                    </AppButton>
                    <AppButton
                        href="/register"
                        variant="primary"
                        size="sm"
                        class="hidden md:inline-flex"
                    >
                        Daftar
                    </AppButton>
                </template>

                <AppLink
                    href="/transaksi"
                    variant="standalone"
                    class="relative inline-flex h-11 w-11 items-center justify-center rounded-xs"
                    aria-label="Riwayat transaksi"
                >
                    <span aria-hidden="true">🧾</span>
                </AppLink>

                <!-- Hamburger (mobile) -->
                <button
                    ref="triggerRef"
                    type="button"
                    class="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xs text-fg-primary hover:bg-surface-muted focus-visible:shadow-focus transition-colors duration-base"
                    :aria-expanded="drawerOpen"
                    aria-controls="mobile-drawer"
                    aria-label="Buka menu navigasi"
                    @click="openDrawer"
                >
                    <span aria-hidden="true">☰</span>
                </button>
            </div>
        </div>

        <!-- Mobile drawer -->
        <Teleport to="body">
            <div
                v-if="drawerOpen"
                class="fixed inset-0 z-50 lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
            >
                <!-- Backdrop -->
                <div
                    class="absolute inset-0 bg-black/70"
                    aria-hidden="true"
                    @click="closeDrawer"
                />

                <!-- Panel -->
                <div
                    ref="drawerRef"
                    class="absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-surface-strong border-l border-surface-muted p-4 overflow-y-auto"
                >
                    <div class="flex items-center justify-between mb-4">
                        <h2 id="drawer-title" class="text-lg font-semibold">Menu</h2>
                        <button
                            type="button"
                            class="inline-flex h-11 w-11 items-center justify-center rounded-xs text-fg-primary hover:bg-surface-muted focus-visible:shadow-focus"
                            aria-label="Tutup menu"
                            @click="closeDrawer"
                        >
                            <span aria-hidden="true">✕</span>
                        </button>
                    </div>

                    <!-- Search (mobile) -->
                    <form
                        class="mb-4"
                        role="search"
                        aria-label="Cari produk"
                        @submit.prevent="submitSearch"
                    >
                        <label for="drawer-search" class="vh">Cari produk</label>
                        <input
                            id="drawer-search"
                            v-model="search"
                            type="search"
                            placeholder="Cari produk…"
                            class="block w-full h-11 px-4 text-md text-fg-primary bg-surface-raised border border-fg-inverse rounded-xs placeholder:text-fg-inverse focus:outline-none focus:border-fg-tertiary focus:shadow-t2"
                        />
                    </form>

                    <nav aria-label="Navigasi utama" class="flex flex-col">
                        <AppLink
                            v-for="link in NAV_LINKS"
                            :key="link.href"
                            :href="link.href"
                            variant="standalone"
                            :current="isCurrent(link.href)"
                            class="block px-3 py-3 rounded-xs text-md hover:bg-surface-muted"
                        >
                            {{ link.label }}
                        </AppLink>
                    </nav>

                    <div class="my-4 h-px bg-surface-muted" />

                    <div class="flex flex-col gap-t7">
                        <template v-if="auth">
                            <AppLink href="/saldo" variant="standalone" class="px-3 py-3 rounded-xs hover:bg-surface-muted">Saldo</AppLink>
                            <AppLink href="/profil" variant="standalone" class="px-3 py-3 rounded-xs hover:bg-surface-muted">Profil</AppLink>
                            <AppLink href="/transaksi" variant="standalone" class="px-3 py-3 rounded-xs hover:bg-surface-muted">Riwayat transaksi</AppLink>
                            <form method="POST" action="/logout">
                                <AppButton type="submit" variant="ghost" block>Keluar</AppButton>
                            </form>
                        </template>
                        <template v-else>
                            <AppButton href="/login" variant="ghost" block>Masuk</AppButton>
                            <AppButton href="/register" variant="primary" block>Daftar gratis</AppButton>
                        </template>
                    </div>
                </div>
            </div>
        </Teleport>
    </header>
</template>
