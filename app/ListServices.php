<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ListServices extends Model
{
    public $timestamps = false;
    protected $primaryKey = 'id_list_service';
    protected $fillable = [
        'service',
        'active'
    ];
}
