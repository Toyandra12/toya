<script setup>
/**
 * Register — uses FormField primitive for every input.
 * Password fields meet the autocomplete=new-password contract.
 */
import { Head, useForm, Link } from '@inertiajs/vue3'

import FormField from '@/Components/UI/FormField.vue'
import AppButton from '@/Components/UI/AppButton.vue'
import AppLink   from '@/Components/UI/AppLink.vue'

const form = useForm({
    name:                  '',
    email:                 '',
    phone:                 '',
    password:              '',
    password_confirmation: '',
    referral_code:         '',
})

function submit() {
    form.post('/register', {
        onFinish: () => form.reset('password', 'password_confirmation'),
    })
}
</script>

<template>
    <Head title="Daftar" />

    <div class="site-container py-12 flex justify-center">
        <div class="w-full max-w-md">
            <header class="text-center mb-6">
                <h1 class="text-3xl font-semibold mb-t5">Buat akun CINENOVA</h1>
                <p class="text-sm text-fg-inverse">
                    Daftar gratis. Mulai top up dalam hitungan detik.
                </p>
            </header>

            <div class="bg-surface-raised rounded-md shadow-t4 p-4 md:p-5">
                <form
                    novalidate
                    class="flex flex-col gap-4"
                    @submit.prevent="submit"
                >
                    <FormField
                        v-model="form.name"
                        label="Nama lengkap"
                        autocomplete="name"
                        placeholder="Nama lengkap"
                        :error="form.errors.name"
                        required
                    />

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
                        v-model="form.phone"
                        label="Nomor telepon"
                        type="tel"
                        inputmode="tel"
                        autocomplete="tel"
                        placeholder="08xx xxxx xxxx"
                        helper="Opsional. Digunakan untuk notifikasi pesanan."
                        :error="form.errors.phone"
                    />

                    <FormField
                        v-model="form.password"
                        label="Password"
                        type="password"
                        autocomplete="new-password"
                        helper="Minimal 8 karakter."
                        :error="form.errors.password"
                        required
                    />

                    <FormField
                        v-model="form.password_confirmation"
                        label="Konfirmasi password"
                        type="password"
                        autocomplete="new-password"
                        :error="form.errors.password_confirmation"
                        required
                    />

                    <FormField
                        v-model="form.referral_code"
                        label="Kode referral"
                        helper="Opsional. Masukkan kode dari teman untuk bonus."
                        :error="form.errors.referral_code"
                    />

                    <AppButton
                        type="submit"
                        variant="primary"
                        size="md"
                        :loading="form.processing"
                        :disabled="form.processing"
                        block
                    >
                        Daftar gratis
                    </AppButton>
                </form>
            </div>

            <p class="text-center text-sm text-fg-inverse mt-4">
                Sudah punya akun?
                <AppLink href="/login" variant="inline">Masuk di sini</AppLink>
            </p>
        </div>
    </div>
</template>
