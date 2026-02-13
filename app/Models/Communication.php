<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Communication extends Model
{
    protected $table = 'communications';

    public $timestamps = false;

    protected $fillable = ['adr_form_id', 'particulars', 'number', 'contact', 'remarks'];

    public function adrForm(): BelongsTo
    {
        return $this->belongsTo(AdrForm::class, 'adr_form_id');
    }
}
