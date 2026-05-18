<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SaldoHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::withCount('transactions')
            ->with('roles')
            ->when($request->search, fn($q) => $q
                ->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->role, fn($q) => $q->role($request->role))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $roles = Role::all(['id', 'name']);

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'roles'   => $roles,
            'filters' => $request->only('search', 'role'),
        ]);
    }

    public function show(User $user)
    {
        $user->load('roles', 'transactions.product.brand');
        $saldoHistory = SaldoHistory::where('user_id', $user->id)->latest()->limit(20)->get();

        return Inertia::render('Admin/Users/Show', [
            'user'         => $user,
            'saldoHistory' => $saldoHistory,
        ]);
    }

    public function toggleActive(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);
        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "User berhasil {$status}.");
    }

    public function assignRole(Request $request, User $user)
    {
        $request->validate(['role' => 'required|exists:roles,name']);
        $user->syncRoles([$request->role]);
        return back()->with('success', 'Role berhasil diperbarui.');
    }

    /**
     * Manually adjust user saldo (credit or debit)
     */
    public function adjustSaldo(Request $request, User $user)
    {
        $request->validate([
            'type'        => 'required|in:credit,debit',
            'amount'      => 'required|numeric|min:1',
            'description' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($request, $user) {
            $before = $user->saldo;

            if ($request->type === 'credit') {
                $user->increment('saldo', $request->amount);
            } else {
                if ($user->saldo < $request->amount) {
                    abort(422, 'Saldo user tidak mencukupi.');
                }
                $user->decrement('saldo', $request->amount);
            }

            $user->refresh();

            SaldoHistory::create([
                'user_id'        => $user->id,
                'type'           => $request->type,
                'amount'         => $request->amount,
                'balance_before' => $before,
                'balance_after'  => $user->saldo,
                'description'    => '[Admin] ' . $request->description,
                'reference_type' => 'manual',
            ]);
        });

        return back()->with('success', 'Saldo user berhasil disesuaikan.');
    }

    /**
     * Reset user password
     */
    public function resetPassword(Request $request, User $user)
    {
        $request->validate(['password' => 'required|min:8|confirmed']);
        $user->update(['password' => Hash::make($request->password)]);
        return back()->with('success', 'Password berhasil direset.');
    }
}
