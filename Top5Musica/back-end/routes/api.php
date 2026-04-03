<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController; // Importante: precisamos avisar onde está o nosso controller
use App\Http\Controllers\Api\SongController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Rota pública: qualquer pessoa pode ver a lista de músicas
Route::get('/songs', [SongController::class, 'index']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
Route::patch('/songs/{id}/view', [SongController::class, 'incrementView'])->middleware('throttle:song-views');
// Rotas protegidas 🛡️: exigem que o usuário esteja autenticado
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/songs', [SongController::class, 'store']);

    Route::middleware('is_admin')->group(function () {
        Route::patch('/songs/{id}/status', [SongController::class, 'updateStatus']);
        Route::put('/songs/{id}', [SongController::class, 'update']);
        Route::delete('/songs/{id}', [SongController::class, 'destroy']);

        Route::prefix('admin')->group(function () {
            Route::get('/songs', [SongController::class, 'adminIndex']);
            Route::get('/users', [UserController::class, 'index']);
            Route::patch('/users/{id}/role', [UserController::class, 'updateRole']);
            Route::delete('/users/{id}', [UserController::class, 'destroy']);
        });
    });
});
