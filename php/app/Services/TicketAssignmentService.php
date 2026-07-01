<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Ticket;
use App\Models\TicketEvent;
use Illuminate\Support\Facades\Log;

class TicketAssignmentService
{
    public const OPEN_STATUS = 'open';

    public function assignAutomatically(Ticket $ticket): ?Agent
    {
        $agent = Agent::query()
            ->where('active', true)
            ->withCount([
                'tickets as open_tickets_count' => fn ($query) => $query->where('status', self::OPEN_STATUS),
            ])
            ->orderBy('open_tickets_count')
            ->orderBy('id')
            ->first();

        if (! $agent) {
            return null;
        }

        $previousAssignedTo = $ticket->assigned_to;

        $ticket->assigned_to = $agent->id;
        $ticket->save();

        if ($previousAssignedTo !== $ticket->assigned_to) {
            Log::info('Responsavel alterado', [
                'ticket_id' => $ticket->id,
                'from_agent_id' => $previousAssignedTo,
                'to_agent_id' => $ticket->assigned_to,
            ]);

            TicketEvent::query()->create([
                'ticket_id' => $ticket->id,
                'type' => 'assigned',
                'message' => 'Responsavel alterado',
                'metadata' => [
                    'from_agent_id' => $previousAssignedTo,
                    'to_agent_id' => $ticket->assigned_to,
                ],
            ]);
        }

        return $agent;
    }
}
