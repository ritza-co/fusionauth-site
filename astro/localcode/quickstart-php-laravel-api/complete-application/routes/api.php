<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

$middleware = Route::middleware('auth:web');
$middleware->get('/user', function (Request $request) {
    return $request->user();
});
$middleware->post('/panic', \App\Http\Controllers\ChangeBank\PanicController::class);
$middleware->get('/make-change', \App\Http\Controllers\ChangeBank\MakeChangeController::class);

