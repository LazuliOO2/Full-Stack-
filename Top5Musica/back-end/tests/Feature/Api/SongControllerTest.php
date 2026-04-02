<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Song;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SongControllerTest extends TestCase
{
    use RefreshDatabase; // Reseta o banco de dados após cada teste

    public function test_usuario_autenticado_pode_sugerir_musica()
    {
        // 1. Prepara o cenário: Cria um usuário de teste
        $user = User::factory()->create();

        // 2. Ação: Simula o login e faz um POST para a rota
        $response = $this->actingAs($user, 'sanctum') // Ajuste 'sanctum' se usar outro guard
            ->postJson('/api/songs', [
                'title' => 'Música de Teste',
                'youtube_link' => 'https://www.youtube.com/watch?v=12345'
            ]);

        // 3. Verificação: Confirma se retornou 201 e salvou no banco
        $response->assertStatus(201)
                 ->assertJsonFragment(['message' => 'Sugestão enviada com sucesso e aguardando aprovação!']);
        
        $this->assertDatabaseHas('songs', [
            'title' => 'Música de Teste'
        ]);
    }
    public function test_usuario_comum_nao_pode_excluir_musica()
    {
        // 1. Prepara: Cria um usuário comum e insere uma música direto no banco
        $user = User::factory()->create(['is_admin' => false]);
        $song = Song::create([
            'title' => 'Música Protegida',
            'youtube_link' => 'https://youtube.com/watch?v=protegido'
        ]);

        // 2. Ação: Simula o usuário comum tentando deletar a música via API
        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/songs/{$song->id}");

        // 3. Verificação: Confirma se a API bloqueou (403) e se a música continua no banco
        $response->assertStatus(403)
                 ->assertJsonFragment(['message' => 'Acesso negado. Apenas administradores.']);
                 
        $this->assertDatabaseHas('songs', [
            'id' => $song->id
        ]);
    }

    public function test_administrador_pode_excluir_musica()
    {
        // 1. Prepara: Cria um usuário ADMINISTRADOR e insere uma música
        $admin = User::factory()->create(['is_admin' => true]);
        $song = Song::create([
            'title' => 'Música a ser excluída',
            'youtube_link' => 'https://youtube.com/watch?v=excluir'
        ]);

        // 2. Ação: Simula o administrador deletando a música
        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/songs/{$song->id}");

        // 3. Verificação: Confirma se deu sucesso (200) e se a música SUMIU do banco
        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Música excluída com sucesso!']);
                 
        $this->assertDatabaseMissing('songs', [
            'id' => $song->id
        ]);
    }
}