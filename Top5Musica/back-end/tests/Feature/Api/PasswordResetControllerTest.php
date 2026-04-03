<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_pode_solicitar_link_de_reset_por_email()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'usuario@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'message' => 'Se existir uma conta para este e-mail, enviaremos um link de redefinição.',
            ]);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_usuario_pode_redefinir_senha_com_token_valido()
    {
        $user = User::factory()->create([
            'email' => 'usuario@example.com',
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NovaSenha123!',
            'password_confirmation' => 'NovaSenha123!',
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'message' => 'Senha redefinida com sucesso.',
            ]);

        $this->assertTrue(Hash::check('NovaSenha123!', $user->fresh()->password));
    }
}
