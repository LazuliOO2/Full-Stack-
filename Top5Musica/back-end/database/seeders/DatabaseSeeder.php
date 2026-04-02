<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Cria um usuário administrador padrão 🌱
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@supliu.com.br',
            'password' => Hash::make('senha123'), // O Laravel criptografa a senha com Hash
            'is_admin' => true, // 🛡️ Garantindo o privilégio
        ]);
    }
}