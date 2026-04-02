<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SongController; // Importante: precisamos avisar onde está o nosso controller
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;


// Rota pública: qualquer pessoa pode ver a lista de músicas
Route::get('/songs', [SongController::class, 'index']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::patch('/songs/{id}/view', [SongController::class, 'incrementView']);
// Rotas protegidas 🛡️: exigem que o usuário esteja autenticado
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/songs', [SongController::class, 'store']);
    Route::patch('/songs/{id}/status', [SongController::class, 'updateStatus']);
    Route::put('/songs/{id}', [SongController::class, 'update']);
    Route::delete('/songs/{id}', [SongController::class, 'destroy']);
    Route::get('/admin/songs', [SongController::class, 'adminIndex']);
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::patch('/admin/users/{id}/role', [UserController::class, 'updateRole']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
});