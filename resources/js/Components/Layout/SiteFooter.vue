<script setup>
/**
 * Secondary navigation region (UI guidelines §4.6 — secondary).
 * Contains: brand summary, link columns, payment partners, legal meta.
 */
import AppLink from '@/Components/UI/AppLink.vue'

const COLUMNS = [
    {
        heading: 'Belanja',
        links: [
            { label: 'Top Up Game',    href: '/kategori/game' },
            { label: 'Pulsa & Data',   href: '/kategori/pulsa' },
            { label: 'Token Listrik',  href: '/kategori/ppob' },
            { label: 'Voucher Digital',href: '/kategori/voucher' },
        ],
    },
    {
        heading: 'Akun',
        links: [
            { label: 'Masuk',            href: '/login' },
            { label: 'Daftar',           href: '/register' },
            { label: 'Riwayat transaksi',href: '/transaksi' },
            { label: 'Saldo saya',       href: '/saldo' },
        ],
    },
    {
        heading: 'Bantuan',
        links: [
            { label: 'Pusat bantuan', href: '/#faq' },
            { label: 'Cara pesan',    href: '/#faq' },
            { label: 'Hubungi kami',  href: 'mailto:support@gamingnp.com' },
        ],
    },
]

const year = new Date().getFullYear()
</script>

<template>
    <footer
        class="bg-surface-muted border-t border-surface-raised mt-12"
        role="contentinfo"
    >
        <div class="site-container py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <!-- Brand column -->
                <div class="md:col-span-1">
                    <div class="flex items-center gap-t5 mb-3">
                        <span
                            class="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-fg-tertiary text-fg-primary font-extrabold"
                            aria-hidden="true"
                        >C</span>
                        <span class="text-2xl font-bold text-fg-primary">CINENOVA</span>
                    </div>
                    <p class="text-sm text-fg-inverse">
                        Top up game, pulsa, paket data, dan PPOB digital terpercaya untuk gamer Indonesia.
                    </p>
                </div>

                <!-- Link columns (4 lists per UI guideline §4.4) -->
                <nav
                    v-for="column in COLUMNS"
                    :key="column.heading"
                    :aria-label="column.heading"
                >
                    <h3 class="text-md font-semibold text-fg-primary mb-3">
                        {{ column.heading }}
                    </h3>
                    <ul class="flex flex-col gap-t5">
                        <li v-for="link in column.links" :key="link.href">
                            <AppLink :href="link.href" variant="meta">
                                {{ link.label }}
                            </AppLink>
                        </li>
                    </ul>
                </nav>
            </div>

            <div class="mt-8 pt-8 border-t border-surface-raised flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p class="text-xs text-fg-inverse">
                    © {{ year }} CINENOVA. Hak cipta dilindungi.
                </p>
                <div class="flex items-center gap-3 text-xs text-fg-inverse">
                    <span>Pembayaran:</span>
                    <span aria-hidden="true">QRIS · OVO · GoPay · DANA · VA · Kartu Kredit</span>
                </div>
            </div>
        </div>
    </footer>
</template>
