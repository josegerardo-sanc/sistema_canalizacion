<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class schoolGroup extends Model
{
    protected $primaryKey = 'id_school_group';
    protected $fillable = [
        'id_users',
        'id_university_careers',
        'semester',
        'shift',
        'period',
        //'group',
    ];
}
