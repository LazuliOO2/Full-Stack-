<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListTicketsTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_tickets_returns_ticket_resources(): void
    {
        $agent = Agent::query()->create(['name' => 'Maria', 'active' => true]);
        $ticket = Ticket::query()->create([
            'title' => 'Erro no login',
            'description' => 'Usuario nao consegue entrar',
            'priority' => 'medium',
            'status' => 'open',
            'assigned_to' => $agent->id,
            'opened_at' => now(),
        ]);

        $response = $this->getJson(route('api.tickets.index'));

        $response->assertOk();
        $response->assertJsonPath('data.0.id', $ticket->id);
        $response->assertJsonPath('data.0.title', 'Erro no login');
        $response->assertJsonPath('data.0.assigned_agent.id', $agent->id);
        $response->assertJsonStructure([
            'data' => [
                [
                    'id',
                    'title',
                    'description',
                    'priority',
                    'status',
                    'assigned_to',
                    'assigned_agent',
                    'opened_at',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }

    public function test_list_tickets_can_be_filtered_by_search_status_and_priority(): void
    {
        Ticket::query()->create([
            'title' => 'Erro no checkout',
            'description' => 'Pagamento com cartao falhou',
            'priority' => 'high',
            'status' => 'open',
            'opened_at' => now(),
        ]);

        Ticket::query()->create([
            'title' => 'Duvida comercial',
            'description' => 'Cliente pediu proposta',
            'priority' => 'low',
            'status' => 'closed',
            'opened_at' => now(),
        ]);

        $response = $this->getJson(route('api.tickets.index', [
            'search' => 'checkout',
            'status' => 'open',
            'priority' => 'high',
        ]));

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.title', 'Erro no checkout');
    }

    public function test_show_ticket_returns_complete_information_and_history(): void
    {
        $agent = Agent::query()->create(['name' => 'Maria', 'active' => true]);
        $ticket = Ticket::query()->create([
            'title' => 'Erro no login',
            'description' => 'Usuario nao consegue entrar',
            'priority' => 'medium',
            'status' => 'open',
            'assigned_to' => $agent->id,
            'opened_at' => now(),
        ]);

        $ticket->events()->create([
            'type' => 'created',
            'message' => 'Chamado criado',
        ]);

        $response = $this->getJson(route('api.tickets.show', $ticket));

        $response->assertOk();
        $response->assertJsonPath('data.id', $ticket->id);
        $response->assertJsonPath('data.assigned_agent.id', $agent->id);
        $response->assertJsonPath('data.history.0.type', 'created');
        $response->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'description',
                'priority',
                'status',
                'assigned_to',
                'assigned_agent',
                'history' => [
                    [
                        'id',
                        'type',
                        'message',
                        'metadata',
                        'created_at',
                    ],
                ],
                'opened_at',
                'created_at',
                'updated_at',
            ],
        ]);
    }
}
