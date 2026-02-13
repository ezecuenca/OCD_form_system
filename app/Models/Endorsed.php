<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Endorsed extends Model
{
    protected $table = 'endorsed';

    public $timestamps = false;

    protected $fillable = ['adr_form_id', 'endorsed'];

    public function adrForm(): BelongsTo
    {
        return $this->belongsTo(AdrForm::class, 'adr_form_id');
    }
}
