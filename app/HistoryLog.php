<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class HistoryLog extends Model
{
    protected $fillable = [
        'id_user',
        'id_user_delete',
        'note'
    ];
}
