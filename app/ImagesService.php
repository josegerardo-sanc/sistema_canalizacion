<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ImagesService extends Model
{
    public $timestamps = false;
    protected $primaryKey = 'id_image_service';
    protected $fillable = [
        'path',
        'priority'
    ];
}
