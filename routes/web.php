<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\HomeController;
use App\Http\Controllers\User\CheckoutController;
use App\Http\Controllers\User\TransactionController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\SaldoController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\SaldoTopupController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\ReportController;
use Illuminate\Support\Facades\Route;

// ─── Auth ────────────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login',    [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login',   [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register',[AuthController::class, 'register']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// ─── Midtrans Webhook (no auth) ────────────────────────────────────────────
Route::post('/webhook/midtrans', [TransactionController::class, 'midtransNotification'])
    ->name('webhook.midtrans');

// ─── User Storefront ────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/kategori/{slug}', [HomeController::class, 'category'])->name('category.show');
Route::get('/kategori/{categorySlug}/{brandSlug}', [HomeController::class, 'brand'])->name('brand.show');

Route::middleware('auth')->group(function () {
    // Checkout
    Route::get('/checkout/{product}', [CheckoutController::class, 'show'])->name('checkout.show');
    Route::post('/checkout/inquiry',  [CheckoutController::class, 'inquiry'])->name('checkout.inquiry');
    Route::post('/checkout/order',    [CheckoutController::class, 'order'])->name('checkout.order');
    Route::post('/checkout/voucher',  [CheckoutController::class, 'validateVoucher'])->name('checkout.voucher');

    // Transactions
    Route::get('/transaksi',                            [TransactionController::class, 'index'])->name('user.transactions');
    Route::get('/transaksi/{invoiceNumber}',             [TransactionController::class, 'show'])->name('user.transaction.show');
    Route::get('/transaksi/{invoiceNumber}/status',      [TransactionController::class, 'checkPaymentStatus'])->name('user.transaction.status');

    // Saldo
    Route::get('/saldo',           [SaldoController::class, 'show'])->name('user.saldo');
    Route::post('/saldo/topup',    [SaldoController::class, 'topup'])->name('user.saldo.topup');

    // Profile
    Route::get('/profil',                     [ProfileController::class, 'show'])->name('user.profile');
    Route::put('/profil',                     [ProfileController::class, 'update'])->name('user.profile.update');
    Route::put('/profil/password',            [ProfileController::class, 'updatePassword'])->name('user.profile.password');
    Route::post('/profil/avatar',             [ProfileController::class, 'updateAvatar'])->name('user.profile.avatar');
    Route::get('/profil/saldo-history',       [ProfileController::class, 'saldoHistory'])->name('user.profile.saldo-history');
});

// ─── Admin Panel ─────────────────────────────────────────────────────────────
Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'role:admin|super-admin'])
    ->group(function () {

    Route::get('/',          [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/analytics', [DashboardController::class, 'analytics'])->name('analytics');

    // Categories
    Route::get('/kategori',           [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/kategori',          [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/kategori/{category}',   [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/kategori/{category}',[CategoryController::class, 'destroy'])->name('categories.destroy');

    // Brands
    Route::get('/brand',          [BrandController::class, 'index'])->name('brands.index');
    Route::post('/brand',         [BrandController::class, 'store'])->name('brands.store');
    Route::put('/brand/{brand}',   [BrandController::class, 'update'])->name('brands.update');
    Route::delete('/brand/{brand}',[BrandController::class, 'destroy'])->name('brands.destroy');

    // Products
    Route::get('/produk',                        [ProductController::class, 'index'])->name('products.index');
    Route::post('/produk',                       [ProductController::class, 'store'])->name('products.store');
    Route::put('/produk/{product}',              [ProductController::class, 'update'])->name('products.update');
    Route::delete('/produk/{product}',           [ProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/produk/import-digiflazz',      [ProductController::class, 'importFromDigiflazz'])->name('products.import-digiflazz');

    // Transactions
    Route::get('/transaksi',                              [AdminTransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transaksi/{transaction}',                [AdminTransactionController::class, 'show'])->name('transactions.show');
    Route::put('/transaksi/{transaction}/status',         [AdminTransactionController::class, 'updateStatus'])->name('transactions.update-status');
    Route::post('/transaksi/{transaction}/retry',         [AdminTransactionController::class, 'retryFulfillment'])->name('transactions.retry');
    Route::post('/transaksi/{transaction}/check-digiflazz',[AdminTransactionController::class, 'checkDigiflazz'])->name('transactions.check-digiflazz');

    // Users
    Route::get('/users',                         [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}',                  [UserController::class, 'show'])->name('users.show');
    Route::post('/users/{user}/toggle-active',   [UserController::class, 'toggleActive'])->name('users.toggle-active');
    Route::post('/users/{user}/assign-role',     [UserController::class, 'assignRole'])->name('users.assign-role');
    Route::post('/users/{user}/adjust-saldo',    [UserController::class, 'adjustSaldo'])->name('users.adjust-saldo');
    Route::post('/users/{user}/reset-password',  [UserController::class, 'resetPassword'])->name('users.reset-password');

    // Sliders
    Route::get('/slider',           [SliderController::class, 'index'])->name('sliders.index');
    Route::post('/slider',          [SliderController::class, 'store'])->name('sliders.store');
    Route::put('/slider/{slider}',   [SliderController::class, 'update'])->name('sliders.update');
    Route::delete('/slider/{slider}',[SliderController::class, 'destroy'])->name('sliders.destroy');

    // FAQs
    Route::get('/faq',          [FaqController::class, 'index'])->name('faqs.index');
    Route::post('/faq',         [FaqController::class, 'store'])->name('faqs.store');
    Route::put('/faq/{faq}',    [FaqController::class, 'update'])->name('faqs.update');
    Route::delete('/faq/{faq}', [FaqController::class, 'destroy'])->name('faqs.destroy');

    // Saldo Top Ups
    Route::get('/saldo-topup',                      [SaldoTopupController::class, 'index'])->name('saldo-topups.index');
    Route::post('/saldo-topup/{saldoTopup}/approve', [SaldoTopupController::class, 'approve'])->name('saldo-topups.approve');
    Route::post('/saldo-topup/{saldoTopup}/reject',  [SaldoTopupController::class, 'reject'])->name('saldo-topups.reject');

    // Notifications
    Route::get('/notifikasi',           [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifikasi',          [NotificationController::class, 'store'])->name('notifications.store');
    Route::delete('/notifikasi/{pushNotification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Roles
    Route::get('/roles',         [RoleController::class, 'index'])->name('roles.index');
    Route::post('/roles',        [RoleController::class, 'store'])->name('roles.store');
    Route::put('/roles/{role}',   [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}',[RoleController::class, 'destroy'])->name('roles.destroy');

    // Reports
    Route::get('/laporan/transaksi', [ReportController::class, 'transactions'])->name('reports.transactions');
    Route::get('/laporan/pendapatan',[ReportController::class, 'revenue'])->name('reports.revenue');
});
