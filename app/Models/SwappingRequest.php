<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SwappingRequest extends Model
{
    protected $table = 'swapping_request';

    protected $fillable = [
        'requester_profile_id',
        'requester_name_snapshot',
        'requester_task_description_snapshot',
        'requester_task_date_snapshot',
        'requester_schedule_id',
        'target_schedule_id',
        'target_name_snapshot',
        'target_task_description_snapshot',
        'target_task_date_snapshot',
        'target_date',
        'original_requester_date',
        'original_target_date',
        'status',
        'approved_by',
        'templates_id',
        'is_archived',
        'archived_at',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
        'requester_task_date_snapshot' => 'date:Y-m-d',
        'target_task_date_snapshot' => 'date:Y-m-d',
        'target_date' => 'date:Y-m-d',
        'original_requester_date' => 'date:Y-m-d',
        'original_target_date' => 'date:Y-m-d',
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
