<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('songs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('youtube_link');
            $table->integer('views')->default(0); // Para controlarmos o ranking das mais tocadas
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // Essencial para a aprovação do admin 
            $table->timestamps();
        });
    }
};
