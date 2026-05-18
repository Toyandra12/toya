<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function transactions(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to'   => 'nullable|date',
        ]);

        $query = Transaction::with(['user', 'product.brand'])
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->when($request->status, fn($q) => $q->where('status', $request->status));

        $summary = [
            'total'         => $query->clone()->count(),
            'total_revenue' => $query->clone()->where('payment_status', 'paid')->sum('total_amount'),
            'success'       => $query->clone()->where('status', 'success')->count(),
            'failed'        => $query->clone()->where('status', 'failed')->count(),
            'pending'       => $query->clone()->where('status', 'pending')->count(),
        ];

        $transactions = $query->latest()->paginate(50)->withQueryString();

        return Inertia::render('Admin/Reports/Transactions', [
            'transactions' => $transactions,
            'summary'      => $summary,
            'filters'      => $request->only('date_from', 'date_to', 'status'),
        ]);
    }

    public function revenue(Request $request)
    {
        $year = $request->year ?? now()->year;

        $monthly = Transaction::where('payment_status', 'paid')
            ->whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as month, SUM(total_amount) as revenue, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $byCategory = Transaction::where('payment_status', 'paid')
            ->whereYear('created_at', $year)
            ->join('products', 'transactions.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('categories.name as category, SUM(transactions.total_amount) as revenue, COUNT(*) as count')
            ->groupBy('category')
            ->orderByDesc('revenue')
            ->get();

        return Inertia::render('Admin/Reports/Revenue', [
            'monthly'    => $monthly,
            'byCategory' => $byCategory,
            'year'       => $year,
        ]);
    }
}
