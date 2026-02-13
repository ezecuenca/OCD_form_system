<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtherItem extends Model
{
    protected $table = 'other_items';

    public $timestamps = false;

    protected $fillable = ['adr_form_id', 'particulars', 'number', 'remarks'];

    public function adrForm(): BelongsTo
    {
        return $this->belongsTo(AdrForm::class, 'adr_form_id');
    }
}
