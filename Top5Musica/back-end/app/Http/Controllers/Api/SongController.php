<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Song;
use Illuminate\Http\Request;

class SongController extends Controller
{
    public function index()
    {
        // Busca as 5 músicas aprovadas com mais visualizações
        $top5 = Song::where('status', 'approved')
            ->orderBy('views', 'desc')
            ->take(5)
            ->get();

        // Pega apenas os IDs do top 5
        $top5Ids = $top5->pluck('id');

        // Busca o restante, excluindo as músicas do top 5
        $others = Song::where('status', 'approved')
            ->whereNotIn('id', $top5Ids)
            ->orderBy('views', 'desc')
            ->paginate(10);

        return response()->json([
            'top5' => $top5,
            'others' => $others
        ]);
    }

    public function store(Request $request)
    {
        // Valida os dados recebidos do React
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'youtube_link' => 'required|url'
        ]);

        // Cria a música no banco de dados
        // O status 'pending' deve estar definido por padrão no model ou migration
        $song = Song::create($validated);

        return response()->json([
            'message' => 'Sugestão enviada com sucesso e aguardando aprovação!',
            'song' => $song
        ], 201);
    }

    public function show(string $id)
    {
        $song = Song::findOrFail($id);

        return response()->json($song);
    }

    // Editar os dados da música (Título ou Link)
    public function update(Request $request, $id)
    {
        if (!$request->user()->is_admin) {
            return response()->json([
                'message' => 'Acesso negado. Apenas administradores.'
            ], 403);
        }

        $song = Song::findOrFail($id);

        // 'sometimes' indica que o campo só será validado se for enviado
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'youtube_link' => 'sometimes|required|url',
        ]);

        $song->update($validated);

        return response()->json([
            'message' => 'Música editada com sucesso!',
            'song' => $song
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        if (!$request->user()->is_admin) {
            return response()->json([
                'message' => 'Acesso negado. Apenas administradores.'
            ], 403);
        }

        // Valida se o status enviado é apenas approved ou rejected
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        // Busca a música pelo ID ou retorna 404
        $song = Song::findOrFail($id);

        // Atualiza o status
        $song->update([
            'status' => $validated['status']
        ]);

        return response()->json([
            'message' => 'Status da música atualizado com sucesso!',
            'song' => $song
        ]);
    }

    // Excluir a música do banco de dados
    public function destroy(Request $request, $id)
    {
        if (!$request->user()->is_admin) {
            return response()->json([
                'message' => 'Acesso negado. Apenas administradores.'
            ], 403);
        }

        $song = Song::findOrFail($id);
        $song->delete();

        return response()->json([
            'message' => 'Música excluída com sucesso!'
        ]);
    }

    // Lista TODAS as músicas (apenas para administrador)
    public function adminIndex(Request $request)
    {
        if (!$request->user()->is_admin) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        // Traz todas as músicas, das mais recentes para as mais antigas
        $songs = Song::orderBy('created_at', 'desc')->get();

        return response()->json($songs);
    }

    public function incrementView($id)
    {
        $song = Song::findOrFail($id);
        $song->increment('views'); // Soma +1 na coluna views diretamente no banco

        return response()->json([
            'message' => 'Visualização contabilizada!',
            'views' => $song->views
        ]);
    }
}