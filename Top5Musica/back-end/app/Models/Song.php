<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
# O Model é tipo uma máquina pronta do Laravel que já sabe:salvar no banco,buscar dados,deletar,atualizar,usar timestamps,fazer queries,relacionamentos,etc
class Song extends Model
{
# Factories servem para criar dados falsos para teste ou seed do banco
    use HasFactory;
# Ele diz quais campos podem ser preenchidos automaticamente quando você faz a query
    protected $fillable = ['title', 'youtube_link', 'views', 'status'];
}
