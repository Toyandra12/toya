# 🏪 Toya — Platform Top Up & PPOB Digital Indonesia

Toya adalah platform top up game, pulsa, paket data, token listrik, BPJS, dan berbagai produk digital lainnya. Dilengkapi admin panel yang lengkap, integrasi Midtrans (payment), Digiflazz (PPOB & pulsa), dan API Games (game top up).

---

## 🧱 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Backend   | Laravel 11 (PHP 8.2+) |
| Frontend  | Vue 3 + Inertia.js |
| Styling   | Tailwind CSS 3 |
| Bundler   | Vite |
| Payment   | Midtrans Snap |
| PPOB      | Digiflazz API |
| Game      | API Games (apigames.id) |
| Auth/RBAC | Laravel Sanctum + Spatie Permission |
| DB        | SQLite (dev) / MySQL (prod) |

---

## 🚀 Setup Lokal

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Toyandra12/toya.git
cd toya

# PHP dependencies
composer install

# Node dependencies
npm install
```

### 2. Environment

```bash
cp .env.example .env
php artisan key:generate
```

Buka `.env` dan isi kredensial:

```env
# Database (SQLite default - siap pakai)
DB_CONNECTION=sqlite

# Midtrans (https://dashboard.midtrans.com)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false

# Digiflazz (https://digiflazz.com/developer)
DIGIFLAZZ_USERNAME=your_username
DIGIFLAZZ_API_KEY=your_api_key

# API Games (https://apigames.id)
APIGAMES_MERCHANT_ID=your_merchant_id
APIGAMES_SECRET=your_secret
```

### 3. Database

```bash
# Buat file SQLite
touch database/database.sqlite

# Jalankan migrasi + seed data contoh
php artisan migrate --seed
```

### 4. Storage Link

```bash
php artisan storage:link
```

### 5. Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

### 6. Jalankan Server

```bash
php artisan serve
```

Buka browser: **http://localhost:8000**

---

## 👤 Akun Default

| Role        | Email                  | Password      |
|-------------|------------------------|---------------|
| Super Admin | superadmin@toya.id     | admin123456   |
| Admin       | admin@toya.id          | admin123456   |
| Operator    | operator@toya.id       | operator123   |
| User        | budi@example.com       | user123456    |

---

## 🗂 Struktur Utama

```
toya/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/          # Admin panel controllers
│   │   │   ├── Auth/           # Login, Register
│   │   │   └── User/           # Storefront controllers
│   │   └── Middleware/
│   │       └── HandleInertiaRequests.php
│   ├── Models/                 # Eloquent models
│   └── Services/
│       ├── DigiflazzService.php   # Digiflazz API
│       ├── MidtransService.php    # Midtrans Snap
│       ├── ApiGamesService.php    # API Games
│       └── TransactionService.php # Business logic
├── config/
│   └── toya.php               # App + API credentials config
├── database/
│   ├── migrations/            # All DB migrations
│   └── seeders/               # Sample data seeders
├── resources/js/
│   ├── Layouts/
│   │   ├── AppLayout.vue      # Storefront layout
│   │   └── AdminLayout.vue    # Admin panel layout
│   └── Pages/
│       ├── Auth/              # Login, Register
│       ├── User/              # Storefront pages
│       └── Admin/             # Admin panel pages
└── routes/
    └── web.php                # All routes
```

---

## 🛒 Fitur Storefront

- **Beranda** — Slider, kategori, brand populer, flash sale, FAQ
- **Kategori** — Browse game, pulsa, paket data, PPOB, dll
- **Brand** — Daftar brand dalam kategori + pilih produk
- **Checkout** — Form input data akun, inquiry validasi, pilih nominal, metode bayar
- **Pembayaran** — Midtrans Snap (VA, QRIS, GoPay, OVO, dll) atau Saldo Akun
- **Kirim Hadiah** — Top up ke akun orang lain dengan pesan
- **Voucher** — Kode diskon persen/nominal dengan batas kuota
- **Transaksi** — Riwayat + detail + auto-refresh status
- **Profil** — Edit data, ubah password, upload avatar, referral code
- **Saldo** — Top up saldo, riwayat kredit/debit

---

## ⚙️ Fitur Admin Panel

| Modul | Fitur |
|-------|-------|
| Dashboard | Stats real-time, chart pendapatan, top produk |
| Analitik | Revenue 6 bulan, per kategori |
| Kategori | CRUD kategori produk |
| Brand | CRUD brand + custom form fields |
| Produk | CRUD produk, import dari Digiflazz |
| Transaksi | List, detail, update status, proses ulang, cek Digiflazz |
| Users | List, detail, adjust saldo, assign role, reset password |
| Saldo Top Up | Approve/reject permintaan top up saldo |
| Slider | CRUD banner/slider beranda |
| FAQ | CRUD pertanyaan umum |
| Notifikasi | Kirim push notification ke semua/sebagian user |
| Roles | CRUD role + permission management |
| Laporan | Laporan transaksi dan pendapatan dengan filter |

---

## 🔗 Integrasi API

### Digiflazz
- Endpoint: `https://api.digiflazz.com/v1/`
- Sign: `md5(username + apiKey + ref_id)`
- Fitur: price list, cek saldo, top up prepaid, bayar postpaid, cek transaksi
- Webhook: `/webhook/midtrans` (shared — Midtrans juga menggunakan endpoint ini)

### Midtrans
- Snap token untuk embed payment
- Callback URL: `/webhook/midtrans`
- Verifikasi signature: `sha512(order_id + status_code + gross_amount + server_key)`
- Support: VA, QRIS, GoPay, OVO, Dana, ShopeePay, kartu kredit

### API Games
- Endpoint: `https://api.apigames.id/api/`
- Fitur: inquiry akun game, place order, cek status
- Sign: `md5(merchantId + secret + ref_id)`

---

## 🔄 Alur Transaksi

```
User pilih produk → Checkout → Bayar (Midtrans/Saldo)
    ↓
Midtrans Webhook → Update payment_status = paid
    ↓
Fulfillment (Digiflazz / API Games)
    ↓
Update status (success/failed) + simpan SN/token
    ↓
User lihat detail transaksi (auto-refresh)
```

---

## 📦 Menambah Produk dari Digiflazz

1. Login admin → Produk → Import Digiflazz
2. Pilih brand tujuan
3. Klik Import — produk akan ditambahkan/diperbarui otomatis
4. Sesuaikan harga jual jika perlu

---

## 🛡 RBAC

| Role | Akses |
|------|-------|
| super-admin | Semua fitur termasuk manage roles |
| admin | Semua fitur kecuali manage roles |
| operator | Dashboard, transaksi, saldo top up, view produk |
| user | Storefront, checkout, profil, saldo |
