<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $table = 'attendance';

    public $timestamps = false;

    protected $fillable = ['profile_id', 'adr_form_id', 'task'];

    public function adrForm(): BelongsTo
    {
        return $this->belongsTo(AdrForm::class, 'adr_form_id');
    }
}
