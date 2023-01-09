<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::group(['middleware' => ['admin','jwt.verify'], 'prefix' => 'v1'], function () {
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
});

Route::group(['middleware' => ['tutor','jwt.verify'], 'prefix' => 'v1'], function () {
    Route::get('/createGroup', 'StudentController@createGroup');
});

Route::group(['middleware' => ['alumno','jwt.verify'], 'prefix' => 'v1'], function () {
    Route::get('/getDataStudent', 'StudentController@getDataStudent'); 
});


Route::group(['middleware' => ['jwt.verify'], 'prefix' => 'v1'], function () {
    /**
     * app/Http/Controllers/AuthController.php
     */
    Route::get('/refreshToken', 'AuthController@refresh');
    Route::get('/logout', 'AuthController@logout');
    #app/Http/Controllers/User/UserController.php
    Route::post('/updateProfile', 'User\UserController@updateProfile');
    Route::post('/updateProfilePassword', 'User\UserController@updateProfilePassword');
    Route::post('/updateImageProfile', 'User\UserController@updateImageProfile');
});


Route::prefix('v1')->group(function () {
    Route::post('/authenticate', 'AuthController@authenticate');
    Route::post('/recoveryPassword', 'User\UserController@recoveryPassword');
    Route::get('/verifyAccount/{id}', 'User\UserController@verifyAccount');
    #app/Http/Controllers/universityCareersController.php
    Route::get('getCareers', 'universityCareersController@getCareers');
    
    //testing
    Route::post('/importUsers', 'User\UserController@importUser');
});

