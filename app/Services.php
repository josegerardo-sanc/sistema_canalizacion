<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Services extends Model
{
    protected $primaryKey = 'id_service';
    protected $fillable = [
        'type',
        'is_active',
        'title',
        'description_short',
        'description_long',
        'price',
        'promotion'
    ];

    public function listServices()
    {
        return $this->hasMany('App\ListServices', 'id_service');
    }
}
