<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $description
 * @property string $priority
 * @property string $status
 * @property int|null $assigned_to
 * @property Carbon|null $opened_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Ticket extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'assigned_to',
        'opened_at',
    ];

    /**
     * @return BelongsTo<Agent, $this>
     */
    public function assignedAgent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'assigned_to');
    }

    /**
     * @return HasMany<TicketEvent, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(TicketEvent::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'assigned_to' => 'integer',
            'opened_at' => 'datetime',
        ];
    }
}
