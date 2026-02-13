<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Advisory extends Model
{
    protected $table = 'advisories';

    public $timestamps = false;

    protected $fillable = ['adr_form_id', 'advisories', 'remarks'];

    public function adrForm(): BelongsTo
    {
        return $this->belongsTo(AdrForm::class, 'adr_form_id');
    }
}
