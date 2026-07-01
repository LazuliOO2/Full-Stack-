<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class CreateTicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_ticket_validates_required_fields(): void
    {
        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.1'])
            ->postJson(route('api.tickets.store'), [
                'description' => 'Descricao do chamado',
                'priority' => 'medium',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['title']);
        $this->assertDatabaseCount('tickets', 0);
    }

    public function test_store_ticket_sanitizes_description_assigns_automatically_and_writes_logs(): void
    {
        Log::spy();
        Agent::query()->create(['name' => 'Maria', 'active' => true]);

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.2'])
            ->postJson(route('api.tickets.store'), [
                'title' => 'Erro no checkout',
                'description' => '<script>alert("x")</script><p>Pagamento falhou</p>',
                'priority' => 'high',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.title', 'Erro no checkout');
        $response->assertJsonPath('data.description', 'Pagamento falhou');
        $response->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'description',
                'priority',
                'status',
                'assigned_to',
                'assigned_agent',
                'history',
                'opened_at',
                'created_at',
                'updated_at',
            ],
        ]);

        $ticket = Ticket::query()->firstOrFail();

        $this->assertSame('Pagamento falhou', $ticket->description);
        $this->assertStringNotContainsString('<script>', $ticket->description);
        $this->assertNotNull($ticket->assigned_to);
        $this->assertDatabaseHas('ticket_events', [
            'ticket_id' => $ticket->id,
            'type' => 'created',
            'message' => 'Chamado criado',
        ]);

        Log::shouldHaveReceived('info')
            ->with('Chamado criado', Mockery::on(fn (array $context): bool => $context['ticket_id'] === $ticket->id))
            ->once();

        Log::shouldHaveReceived('info')
            ->with('Responsavel alterado', Mockery::on(fn (array $context): bool => $context['ticket_id'] === $ticket->id))
            ->once();
    }

    public function test_store_ticket_can_be_assigned_manually(): void
    {
        $agent = Agent::query()->create(['name' => 'Joao', 'active' => true]);

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.3'])
            ->postJson(route('api.tickets.store'), [
                'title' => 'Erro no login',
                'description' => 'Usuario nao consegue entrar',
                'priority' => 'medium',
                'assigned_to' => $agent->id,
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.assigned_to', $agent->id);
        $response->assertJsonPath('data.assigned_agent.id', $agent->id);
    }

    public function test_store_ticket_is_rate_limited(): void
    {
        Agent::query()->create(['name' => 'Maria', 'active' => true]);

        $payload = [
            'title' => 'Erro no checkout',
            'description' => 'Pagamento falhou',
            'priority' => 'high',
        ];

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this
                ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
                ->postJson(route('api.tickets.store'), $payload)
                ->assertCreated();
        }

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->postJson(route('api.tickets.store'), $payload)
            ->assertTooManyRequests();
    }
}
