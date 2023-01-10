<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SchoolGroup extends Model
{
    protected $primaryKey = 'id_school_group';
    protected $fillable = [
        'id_users',
        'id_university_careers',
        'semester',
        'shift',
        'year_period',
        'period',
        //'group',
    ];
}
