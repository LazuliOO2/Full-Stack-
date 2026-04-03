<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Lista todos os usuários
    public function index(Request $request)
    {
        return response()->json(User::all());
    }

    // Promove ou rebaixa um usuário
    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Você não pode alterar seus próprios privilégios.'], 400);
        }

        //  Atribuir a propriedade diretamente e salvar
        $user->is_admin = ! $user->is_admin;
        $user->save();

        return response()->json(['message' => 'Privilégios atualizados com sucesso!']);
    }

    // Exclui um usuário
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Você não pode excluir sua própria conta.'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'Usuário excluído com sucesso!']);
    }
}
