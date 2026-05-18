<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Dashboard
            'view dashboard',
            'view analytics',
            // Categories
            'view categories', 'create categories', 'edit categories', 'delete categories',
            // Brands
            'view brands', 'create brands', 'edit brands', 'delete brands',
            // Products
            'view products', 'create products', 'edit products', 'delete products', 'import products',
            // Transactions
            'view transactions', 'edit transactions', 'process transactions',
            // Users
            'view users', 'edit users', 'manage user saldo',
            // Content
            'manage sliders', 'manage faqs', 'manage notifications',
            // Finance
            'view saldo topups', 'approve saldo topups',
            // Reports
            'view reports',
            // Roles
            'manage roles',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Super Admin – all permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // Admin – most permissions, no role management
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(
            Permission::whereNotIn('name', ['manage roles'])->get()
        );

        // Operator – limited: view + basic transaction ops
        $operator = Role::firstOrCreate(['name' => 'operator', 'guard_name' => 'web']);
        $operator->syncPermissions([
            'view dashboard',
            'view transactions', 'edit transactions', 'process transactions',
            'view saldo topups', 'approve saldo topups',
            'view products', 'view categories', 'view brands',
        ]);

        // Regular user
        Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
    }
}
