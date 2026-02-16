<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    protected $table = 'templates';

    public $timestamps = true;

    protected $fillable = [
        'template_name',
        'html_layout',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
