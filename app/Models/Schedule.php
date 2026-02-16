<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    protected $table = 'schedule';

    protected $fillable = [
        'profile_id',
        'task_description',
        'task_date',
        'status',
    ];

    protected $casts = [
        'task_date' => 'date:Y-m-d',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'profile_id');
    }
}
