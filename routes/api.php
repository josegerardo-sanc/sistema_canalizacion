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
    /*
    Route::get('/getAuthenticatedUser', 'AuthController@getAuthenticatedUser');
    Route::get('/getRoles', 'User\UserController@getRoles');
    Route::post('/getUsers', 'User\UserController@getUser');
    Route::post('/saveUser', 'User\UserController@saveUser');
    Route::get('/deleteUser/{id}', 'User\UserController@deleteUser');
    */
});
Route::prefix('v1')->group(function () {
    Route::post('/authenticate', 'AuthController@authenticate');
});
