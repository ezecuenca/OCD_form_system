<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SwappingRequest extends Model
{
    protected $table = 'swapping_request';

    protected $fillable = [
        'requester_profile_id',
        'requester_schedule_id',
        'target_schedule_id',
        'target_date',
        'status',
        'approved_by',
        'is_archived',
        'archived_at',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
        'target_date' => 'date:Y-m-d',
    ];

    public function requesterProfile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'requester_profile_id');
    }

    public function requesterSchedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class, 'requester_schedule_id');
    }

    public function targetSchedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class, 'target_schedule_id');
    }

    public function approvedByProfile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'approved_by');
    }
}
