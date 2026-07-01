<?php

namespace App\Http\Controllers;

use App\Http\Resources\AgentResource;
use App\Models\Agent;
use App\Services\TicketAssignmentService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AgentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $agents = Agent::query()
            ->withCount([
                'tickets',
                'tickets as open_tickets_count' => fn ($query) => $query->where('status', TicketAssignmentService::OPEN_STATUS),
            ])
            ->orderBy('name')
            ->get();

        return AgentResource::collection($agents);
    }
}
