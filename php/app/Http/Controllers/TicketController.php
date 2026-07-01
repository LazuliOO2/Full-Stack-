<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketEvent;
use App\Services\TicketAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $tickets = Ticket::query()
            ->with('assignedAgent')
            ->when($request->string('search')->trim()->isNotEmpty(), function ($query) use ($request): void {
                $search = $request->string('search')->trim()->toString();

                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('priority'), fn ($query) => $query->where('priority', $request->string('priority')->toString()))
            ->latest('id')
            ->get();

        return TicketResource::collection($tickets);
    }

    public function show(Ticket $ticket): TicketResource
    {
        return new TicketResource($ticket->load([
            'assignedAgent',
            'events' => fn ($query) => $query->latest('id'),
        ]));
    }

    public function store(StoreTicketRequest $request, TicketAssignmentService $assignmentService): JsonResponse
    {
        $data = $request->validated();
        $data['status'] ??= TicketAssignmentService::OPEN_STATUS;
        $data['opened_at'] ??= now();

        $ticket = Ticket::query()->create($data);

        Log::info('Chamado criado', [
            'ticket_id' => $ticket->id,
            'assigned_to' => $ticket->assigned_to,
        ]);

        $this->recordEvent($ticket, 'created', 'Chamado criado');

        if ($ticket->assigned_to === null) {
            $assignmentService->assignAutomatically($ticket);
        } else {
            $this->logResponsibleChange($ticket, null, $ticket->assigned_to);
        }

        return (new TicketResource($ticket->refresh()->load(['assignedAgent', 'events'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $previousAssignedTo = $ticket->assigned_to;

        $ticket->fill($request->validated());
        $ticket->save();

        Log::info('Chamado atualizado', [
            'ticket_id' => $ticket->id,
            'assigned_to' => $ticket->assigned_to,
        ]);

        $this->recordEvent($ticket, 'updated', 'Chamado atualizado');

        if ($previousAssignedTo !== $ticket->assigned_to) {
            $this->logResponsibleChange($ticket, $previousAssignedTo, $ticket->assigned_to);
        }

        return (new TicketResource($ticket->refresh()->load(['assignedAgent', 'events'])))
            ->response();
    }

    public function patch(UpdateTicketRequest $request, Ticket $ticket): JsonResponse
    {
        return $this->update($request, $ticket);
    }

    private function logResponsibleChange(Ticket $ticket, ?int $fromAgentId, ?int $toAgentId): void
    {
        Log::info('Responsavel alterado', [
            'ticket_id' => $ticket->id,
            'from_agent_id' => $fromAgentId,
            'to_agent_id' => $toAgentId,
        ]);

        $this->recordEvent($ticket, 'assigned', 'Responsavel alterado', [
            'from_agent_id' => $fromAgentId,
            'to_agent_id' => $toAgentId,
        ]);
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function recordEvent(Ticket $ticket, string $type, string $message, array $metadata = []): void
    {
        TicketEvent::query()->create([
            'ticket_id' => $ticket->id,
            'type' => $type,
            'message' => $message,
            'metadata' => $metadata === [] ? null : $metadata,
        ]);
    }
}
