<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Catalog extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'id_catalog';
    protected $fillable = [
        'name',
        'icon'
    ];
}
