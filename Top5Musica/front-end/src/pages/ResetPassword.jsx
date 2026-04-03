import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiUrl } from '../lib/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasToken = useMemo(() => token.length > 0, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('/api/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Senha redefinida com sucesso.');
        window.setTimeout(() => navigate('/auth'), 1500);
      } else {
        setError(data.message || 'Não foi possível redefinir a senha.');
      }
    } catch {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7] font-sans px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-100">
        <div className="mb-6 text-left">
          <Link to="/auth" className="text-sm text-gray-500 hover:text-[#8B4513] transition-colors flex items-center gap-1 font-medium">
            &larr; Voltar para o login
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-[#8B4513] mb-2">Definir nova senha</h1>
        <p className="text-sm text-gray-600 mb-6">
          Escolha uma nova senha para continuar.
        </p>

        {!hasToken && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
            O link de redefinição está incompleto ou inválido.
          </div>
        )}

        {message && <div className="bg-green-50 text-green-700 p-3 rounded mt-4 text-sm">{message}</div>}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mt-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Nova senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Confirmar nova senha</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!hasToken || isLoading}
            className="w-full bg-[#8B4513] text-white font-bold py-2 px-4 rounded hover:bg-orange-900 transition disabled:opacity-70"
          >
            {isLoading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
