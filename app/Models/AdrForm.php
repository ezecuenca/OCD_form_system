<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdrForm extends Model
{
    protected $table = 'adr_form';

    protected $fillable = [
        'profile_id',
        'document_name',
        'subject',
        'alert_status',
        'is_archived',
        'archived_at',
        'templates_id',
        'form_data',
    ];

    protected $casts = [
        'form_data' => 'array',
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function advisories(): HasMany
    {
        return $this->hasMany(Advisory::class, 'adr_form_id');
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(Attendance::class, 'adr_form_id');
    }

    public function communications(): HasMany
    {
        return $this->hasMany(Communication::class, 'adr_form_id');
    }

    public function concerns(): HasMany
    {
        return $this->hasMany(Concern::class, 'adr_form_id');
    }

    public function endorsed(): HasMany
    {
        return $this->hasMany(Endorsed::class, 'adr_form_id');
    }

    public function otherItems(): HasMany
    {
        return $this->hasMany(OtherItem::class, 'adr_form_id');
    }
}
