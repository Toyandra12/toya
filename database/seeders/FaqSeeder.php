<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            ['question' => 'Bagaimana cara melakukan top up game?', 'answer' => 'Pilih game yang ingin di-top up, masukkan ID akun Anda, pilih nominal, lalu selesaikan pembayaran. Top up akan diproses secara otomatis dalam hitungan menit.', 'category' => 'topup', 'sort_order' => 1],
            ['question' => 'Berapa lama proses top up berlangsung?', 'answer' => 'Proses top up berlangsung secara instan (1-5 menit). Jika melebihi 30 menit, silakan hubungi CS kami.', 'category' => 'topup', 'sort_order' => 2],
            ['question' => 'Metode pembayaran apa saja yang tersedia?', 'answer' => 'Kami menerima pembayaran via Transfer Bank, Virtual Account, QRIS, GoPay, OVO, Dana, ShopeePay, dan Saldo Akun Toya.', 'category' => 'payment', 'sort_order' => 3],
            ['question' => 'Apakah transaksi dijamin aman?', 'answer' => 'Ya! Kami menggunakan teknologi enkripsi dan gateway pembayaran terpercaya Midtrans untuk menjamin keamanan setiap transaksi.', 'category' => 'payment', 'sort_order' => 4],
            ['question' => 'Bagaimana jika transaksi gagal?', 'answer' => 'Jika transaksi gagal dan pembayaran telah dilakukan, dana akan dikembalikan ke saldo akun Anda dalam 1x24 jam kerja.', 'category' => 'general', 'sort_order' => 5],
            ['question' => 'Bagaimana cara mengisi saldo akun Toya?', 'answer' => 'Masuk ke menu Saldo > Top Up Saldo. Masukkan nominal yang diinginkan (minimum Rp 10.000) dan selesaikan pembayaran via Midtrans.', 'category' => 'account', 'sort_order' => 6],
            ['question' => 'Apakah ada biaya admin?', 'answer' => 'Tidak ada biaya admin tersembunyi. Harga yang tertera adalah harga final yang Anda bayar.', 'category' => 'payment', 'sort_order' => 7],
            ['question' => 'Bisakah saya top up untuk orang lain (kirim hadiah)?', 'answer' => 'Bisa! Gunakan fitur "Kirim sebagai Hadiah" saat checkout. Masukkan informasi penerima dan pesan Anda.', 'category' => 'topup', 'sort_order' => 8],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(['question' => $faq['question']], array_merge($faq, ['is_active' => true]));
        }
    }
}
