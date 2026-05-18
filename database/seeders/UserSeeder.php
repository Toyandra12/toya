<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@toya.id'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('admin123456'),
                'phone'    => '081234567890',
                'is_active'=> true,
            ]
        );
        $superAdmin->assignRole('super-admin');

        // Admin
        $admin = User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@toya.id')],
            [
                'name'     => 'Admin Toya',
                'password' => Hash::make(env('ADMIN_PASSWORD', 'admin123456')),
                'phone'    => '081234567891',
                'is_active'=> true,
            ]
        );
        $admin->assignRole('admin');

        // Operator
        $operator = User::firstOrCreate(
            ['email' => 'operator@toya.id'],
            [
                'name'     => 'Operator',
                'password' => Hash::make('operator123'),
                'phone'    => '081234567892',
                'is_active'=> true,
            ]
        );
        $operator->assignRole('operator');

        // Sample users
        $sampleUsers = [
            ['name' => 'Budi Santoso',   'email' => 'budi@example.com',   'saldo' => 150000],
            ['name' => 'Siti Rahayu',    'email' => 'siti@example.com',   'saldo' => 75000],
            ['name' => 'Agus Pratama',   'email' => 'agus@example.com',   'saldo' => 200000],
        ];

        foreach ($sampleUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name'     => $userData['name'],
                    'password' => Hash::make('user123456'),
                    'saldo'    => $userData['saldo'],
                    'is_active'=> true,
                ]
            );
            $user->assignRole('user');
        }
    }
}
