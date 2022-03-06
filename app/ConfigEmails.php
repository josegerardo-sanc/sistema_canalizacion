<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ConfigEmails extends Model
{

    public $timestamps = false;

    protected $primaryKey = 'id_config_emails';
    protected $fillable = [
        'host',
        'username',
        'password',
        'puerto',
        'email_remitente',
        'name_remitente',
        'encryption'
    ];
}
