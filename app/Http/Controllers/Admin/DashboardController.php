<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Product;
use App\Services\DigiflazzService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(private DigiflazzService $digiflazz) {}

    public function index()
    {
        $today = now()->startOfDay();

        // Stats
        $stats = [
            'total_users'            => User::count(),
            'new_users_today'        => User::whereDate('created_at', today())->count(),
            'total_transactions'     => Transaction::count(),
            'transactions_today'     => Transaction::whereDate('created_at', today())->count(),
            'revenue_today'          => Transaction::whereDate('created_at', today())->where('payment_status', 'paid')->sum('total_amount'),
            'revenue_month'          => Transaction::whereMonth('created_at', now()->month)->where('payment_status', 'paid')->sum('total_amount'),
            'pending_transactions'   => Transaction::where('status', 'pending')->count(),
            'failed_transactions'    => Transaction::where('status', 'failed')->count(),
        ];

        // Revenue chart – last 7 days
        $revenueChart = Transaction::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Recent transactions
        $recentTransactions = Transaction::with(['user', 'product.brand'])
            ->latest()
            ->limit(10)
            ->get();

        // Top products
        $topProducts = Transaction::where('payment_status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->selectRaw('product_id, COUNT(*) as count, SUM(total_amount) as revenue')
            ->groupBy('product_id')
            ->with('product.brand')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats'              => $stats,
            'revenueChart'       => $revenueChart,
            'recentTransactions' => $recentTransactions,
            'topProducts'        => $topProducts,
        ]);
    }

    public function analytics()
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date     = now()->subMonths($i);
            $months[] = [
                'label'    => $date->format('M Y'),
                'revenue'  => Transaction::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
                'count'    => Transaction::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        }

        $categoryRevenue = Transaction::where('payment_status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->join('products', 'transactions.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('categories.name, SUM(transactions.total_amount) as revenue')
            ->groupBy('categories.name')
            ->get();

        return Inertia::render('Admin/Analytics', [
            'monthlyChart'    => $months,
            'categoryRevenue' => $categoryRevenue,
        ]);
    }
}
