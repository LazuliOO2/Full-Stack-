<?php

namespace Database\Seeders;

use App\Models\Agent;
use Illuminate\Database\Seeder;

class AgentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        collect([
            'João',
            'Maria',
            'Carlos',
        ])->each(fn (string $name) => Agent::query()->updateOrCreate(
            ['name' => $name],
            ['active' => true],
        ));
    }
}
