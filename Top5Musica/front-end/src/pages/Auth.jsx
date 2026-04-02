import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- Adicionamos o Link aqui

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.is_admin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Erro na autenticação. Verifique os dados.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7] font-sans px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-100 relative">
        
        {/* --- BOTÃO DE VOLTAR --- */}
        <div className="mb-6 text-left">
          <Link to="/" className="text-sm text-gray-500 hover:text-[#8B4513] transition-colors flex items-center gap-1 font-medium">
            &larr; Voltar para a Home
          </Link>
        </div>
        {/* ----------------------- */}

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex-1 py-2 font-bold text-center transition-colors ${isLogin ? 'text-[#8B4513] border-b-2 border-[#8B4513]' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Entrar
          </button>
          <button
            className={`flex-1 py-2 font-bold text-center transition-colors ${!isLogin ? 'text-[#8B4513] border-b-2 border-[#8B4513]' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Criar Conta
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Nome</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required={!isLogin} 
              />
            </div>
          )}
          
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
            <label className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#8B4513] text-white font-bold py-2 px-4 rounded hover:bg-orange-900 transition mt-4"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
}