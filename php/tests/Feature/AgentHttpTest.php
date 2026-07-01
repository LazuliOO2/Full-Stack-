<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgentHttpTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_agents_returns_agent_resources(): void
    {
        $agent = Agent::query()->create(['name' => 'Maria', 'active' => true]);

        Ticket::query()->create([
            'title' => 'Erro no login',
            'description' => 'Usuario nao consegue entrar',
            'priority' => 'medium',
            'status' => 'open',
            'assigned_to' => $agent->id,
            'opened_at' => now(),
        ]);

        Ticket::query()->create([
            'title' => 'Erro antigo',
            'description' => 'Chamado encerrado',
            'priority' => 'low',
            'status' => 'closed',
            'assigned_to' => $agent->id,
            'opened_at' => now(),
        ]);

        $response = $this->getJson(route('api.agents.index'));

        $response->assertOk();
        $response->assertJsonPath('data.0.id', $agent->id);
        $response->assertJsonPath('data.0.name', 'Maria');
        $response->assertJsonPath('data.0.active', true);
        $response->assertJsonPath('data.0.tickets_count', 2);
        $response->assertJsonPath('data.0.open_tickets_count', 1);
        $response->assertJsonStructure([
            'data' => [
                [
                    'id',
                    'name',
                    'active',
                    'tickets_count',
                    'open_tickets_count',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }
}
