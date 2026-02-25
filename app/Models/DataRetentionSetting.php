<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataRetentionSetting extends Model
{
    protected $table = 'data_retention_settings';

    protected $fillable = [
        'enabled',
        'retention_value',
        'retention_unit',
        'purge_enabled',
        'purge_after_value',
        'purge_after_unit',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'purge_enabled' => 'boolean',
    ];
}
