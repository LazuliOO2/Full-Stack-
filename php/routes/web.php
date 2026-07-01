<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Welcome')->name('home');

Route::prefix('api')->name('api.')->group(function (): void {
    Route::get('tickets', [TicketController::class, 'index'])
        ->name('tickets.index');

    Route::post('tickets', [TicketController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('tickets.store');

    Route::put('tickets/{ticket}', [TicketController::class, 'update'])
        ->name('tickets.update');

    Route::patch('tickets/{ticket}', [TicketController::class, 'patch'])
        ->name('tickets.patch');

    Route::get('tickets/{ticket}', [TicketController::class, 'show'])
        ->name('tickets.show');

    Route::get('agents', [AgentController::class, 'index'])
        ->name('agents.index');
});
