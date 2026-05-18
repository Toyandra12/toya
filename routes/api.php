<?php

use Illuminate\Support\Facades\Route;

// Health check
Route::get('/ping', fn() => response()->json(['pong' => true]));
