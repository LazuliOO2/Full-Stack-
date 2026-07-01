<?php

namespace App\Http\Resources;

use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Agent
 *
 * @property-read int|null $open_tickets_count
 */
class AgentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'active' => $this->active,
            'tickets_count' => $this->whenCounted('tickets'),
            'open_tickets_count' => $this->when(isset($this->open_tickets_count), $this->open_tickets_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
