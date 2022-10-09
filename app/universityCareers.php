<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class universityCareers extends Model
{
    protected $primaryKey = 'id_university_careers';
    protected $fillable = [
        'name'
    ];
}
