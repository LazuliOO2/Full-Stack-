<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class UpdateTicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_ticket_logs_update_and_responsible_change(): void
    {
        Log::spy();

        $maria = Agent::query()->create(['name' => 'Maria', 'active' => true]);
        $joao = Agent::query()->create(['name' => 'Joao', 'active' => true]);
        $ticket = Ticket::query()->create([
            'title' => 'Erro no login',
            'description' => 'Usuario nao consegue entrar',
            'priority' => 'medium',
            'status' => 'open',
            'assigned_to' => $maria->id,
            'opened_at' => now(),
        ]);

        $response = $this->patchJson(route('api.tickets.patch', $ticket), [
            'description' => '<script>bad()</script>Resolvido parcialmente',
            'assigned_to' => $joao->id,
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.description', 'Resolvido parcialmente');
        $response->assertJsonPath('data.assigned_to', $joao->id);

        $ticket->refresh();

        $this->assertSame('Resolvido parcialmente', $ticket->description);
        $this->assertSame($joao->id, $ticket->assigned_to);
        $this->assertDatabaseHas('ticket_events', [
            'ticket_id' => $ticket->id,
            'type' => 'updated',
            'message' => 'Chamado atualizado',
        ]);
        $this->assertDatabaseHas('ticket_events', [
            'ticket_id' => $ticket->id,
            'type' => 'assigned',
            'message' => 'Responsavel alterado',
        ]);

        Log::shouldHaveReceived('info')
            ->with('Chamado atualizado', Mockery::on(fn (array $context): bool => $context['ticket_id'] === $ticket->id))
            ->once();

        Log::shouldHaveReceived('info')
            ->with('Responsavel alterado', Mockery::on(fn (array $context): bool => $context['from_agent_id'] === $maria->id
                && $context['to_agent_id'] === $joao->id))
            ->once();
    }

    public function test_update_ticket_validates_payload(): void
    {
        $ticket = Ticket::query()->create([
            'title' => 'Erro no login',
            'description' => 'Usuario nao consegue entrar',
            'priority' => 'medium',
            'status' => 'open',
            'opened_at' => now(),
        ]);

        $response = $this->putJson(route('api.tickets.update', $ticket), [
            'priority' => 'urgent',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['priority']);
    }
}
