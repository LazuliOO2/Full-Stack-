<?php

namespace Tests\Unit;

use App\Models\Agent;
use App\Models\Ticket;
use App\Services\TicketAssignmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketAssignmentServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigns_ticket_to_active_agent_with_fewest_open_tickets(): void
    {
        $maria = Agent::query()->create(['name' => 'Maria', 'active' => true]);
        $joao = Agent::query()->create(['name' => 'Joao', 'active' => true]);
        Agent::query()->create(['name' => 'Carlos', 'active' => false]);

        $this->createTicketFor($maria, 'open');
        $this->createTicketFor($maria, 'open');
        $this->createTicketFor($joao, 'closed');

        $ticket = Ticket::query()->create([
            'title' => 'Novo chamado',
            'description' => 'Descricao do chamado',
            'priority' => 'medium',
            'status' => 'open',
            'opened_at' => now(),
        ]);

        $assignedAgent = app(TicketAssignmentService::class)->assignAutomatically($ticket);

        $this->assertTrue($assignedAgent->is($joao));
        $this->assertTrue($ticket->refresh()->assignedAgent->is($joao));
    }

    public function test_returns_null_when_there_are_no_active_agents(): void
    {
        Agent::query()->create(['name' => 'Carlos', 'active' => false]);

        $ticket = Ticket::query()->create([
            'title' => 'Novo chamado',
            'description' => 'Descricao do chamado',
            'priority' => 'low',
            'status' => 'open',
            'opened_at' => now(),
        ]);

        $assignedAgent = app(TicketAssignmentService::class)->assignAutomatically($ticket);

        $this->assertNull($assignedAgent);
        $this->assertNull($ticket->refresh()->assigned_to);
    }

    private function createTicketFor(Agent $agent, string $status): Ticket
    {
        return Ticket::query()->create([
            'title' => "Chamado {$status}",
            'description' => 'Descricao do chamado',
            'priority' => 'medium',
            'status' => $status,
            'assigned_to' => $agent->id,
            'opened_at' => now(),
        ]);
    }
}
