<?php

use Illuminate\Support\Facades\Route;


Route::view('{path}', 'dashboard')->where('path', '([A-z\d\-\/_.]+)?');
