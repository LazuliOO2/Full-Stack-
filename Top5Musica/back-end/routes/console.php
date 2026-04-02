<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('migrar:dados', function () {
    $this->info('Iniciando a cópia dos dados...');

    // Copiando os Usuários
    $users = DB::connection('sqlite_old')->table('users')->get();
    foreach ($users as $user) {
        DB::table('users')->insert((array) $user);
    }
    $this->info('Usuários copiados com sucesso!');

    // Copiando as Músicas
    $songs = DB::connection('sqlite_old')->table('songs')->get();
    foreach ($songs as $song) {
        DB::table('songs')->insert((array) $song);
    }
    $this->info('Músicas copiadas com sucesso!');

})->purpose('Copia dados do SQLite antigo para o MySQL novo');

