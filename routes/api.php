<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::group(['middleware' => ['jwt.verify'], 'prefix' => 'v1'], function () {
    /**
     * app/Http/Controllers/AuthController.php
     */
    Route::get('/refreshToken', 'AuthController@refresh');
    Route::get('/logout', 'AuthController@logout');
    #app/Http/Controllers/User/UserController.php
    Route::post('/updateProfile', 'User\UserController@updateProfile');
    Route::post('/updateImageProfile', 'User\UserController@updateImageProfile');
    Route::get('/getRoles', 'User\UserController@getRoles');
    Route::post('/saveUser', 'User\UserController@saveUser');
    Route::post('/getUsers', 'User\UserController@getUsers');
    Route::get('/deleteUser/{id}', 'User\UserController@deleteUser');
    Route::post('/updateAccount', 'User\UserController@updateAccount');
    #app/Http/Controllers/ConfigEmailController.php
    Route::post('/saveConfigEmail', 'ConfigEmailController@saveConfigEmail');
    Route::post('/getConfigEmail', 'ConfigEmailController@getConfigEmail');


    /**exports */
    Route::post('/exportUsers', 'User\UserController@exportUsers');

    /**service */
    #app/Http/Controllers/Service/ServiceController.php
    Route::post('/saveService', 'Service\ServiceController@saveService');
    Route::post('/updateStatusService', 'Service\ServiceController@updateStatusService');
    Route::get('/deleteService/{id}', 'Service\ServiceController@deleteService');
});
Route::prefix('v1')->group(function () {
    Route::post('/authenticate', 'AuthController@authenticate');
    Route::post('/recoveryPassword', 'User\UserController@recoveryPassword');

    /**service */
    #app/Http/Controllers/Service/ServiceController.php
    Route::post('/getService', 'Service\ServiceController@getService');
});
