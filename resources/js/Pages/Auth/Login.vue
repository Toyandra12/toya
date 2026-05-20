<script setup>
/**
 * Login — auth form using FormField primitive.
 * - Inertia useForm handles validation/error mapping.
 * - Errors are surfaced via FormField's role="alert" region (A11Y-6).
 * - "Lupa password?" + Register links use AppLink for consistent state rules.
 */
import { Head, useForm, Link } from '@inertiajs/vue3'

import FormField from '@/Components/UI/FormField.vue'
import AppButton from '@/Components/UI/AppButton.vue'
import AppLink   from '@/Components/UI/AppLink.vue'

const form = useForm({
    email:    '',
    password: '',
    remember: false,
})

function submit() {
    form.post('/login', {
        onFinish: () => form.reset('password'),
    })
}
</script>

<template>
    <Head title="Masuk" />

    <div class="site-container py-12 flex justify-center">
        <div class="w-full max-w-md">
            <header class="text-center mb-6">
                <h1 class="text-3xl font-semibold mb-t5">Selamat datang kembali</h1>
                <p class="text-sm text-fg-inverse">
                    Masuk untuk lanjut belanja dan cek riwayat transaksi.
                </p>
            </header>

            <div class="bg-surface-raised rounded-md shadow-t4 p-4 md:p-5">
                <form
                    novalidate
                    class="flex flex-col gap-4"
                    @submit.prevent="submit"
                    :aria-busy="form.processing || undefined"
                >
                    <FormField
                        v-model="form.email"
                        label="Email"
                        type="email"
                        autocomplete="email"
                        placeholder="nama@email.com"
                        :error="form.errors.email"
                        required
                    />

                    <FormField
                        v-model="form.password"
                        label="Password"
                        type="password"
                        autocomplete="current-password"
                        :error="form.errors.password"
                        required
                    />

                    <div class="flex items-center justify-between">
                        <label class="inline-flex items-center gap-t5 text-sm text-fg-secondary cursor-pointer">
                            <input
                                v-model="form.remember"
                                type="checkbox"
                                class="h-4 w-4 rounded-xs accent-fg-tertiary"
                            />
                            <span>Ingat saya</span>
                        </label>

                        <AppLink href="/register" variant="meta">Belum punya akun?</AppLink>
                    </div>

                    <AppButton
                        type="submit"
                        variant="primary"
                        size="md"
                        :loading="form.processing"
                        :disabled="form.processing"
                        block
                    >
                        Masuk
                    </AppButton>
                </form>
            </div>

            <p class="text-center text-sm text-fg-inverse mt-4">
                Dengan masuk, Anda menyetujui
                <AppLink href="/#faq" variant="inline">syarat layanan</AppLink>
                kami.
            </p>
        </div>
    </div>
</template>
