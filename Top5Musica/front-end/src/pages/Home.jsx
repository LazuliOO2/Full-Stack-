import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import SuggestionForm from '../components/SuggestionForm';
import RankingList from '../components/RankingList';

export default function Home() {
  const [top5, setTop5] = useState([]);
  const [others, setOthers] = useState(null);
  
  // Criamos um estado para guardar os dados do usuário logado
  const [user, setUser] = useState(null);

  const fetchSongs = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:8000/api/songs?page=${page}`);
      const data = await response.json();
      setTop5(data.top5);
      setOthers(data.others);
    } catch (error) {
      console.error("Erro ao buscar músicas:", error);
    }
  };

  useEffect(() => {
    // Ao carregar a página, verifica se existe um usuário salvo no localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    fetchSongs();
  }, []);

  // Função para limpar o login e atualizar a tela
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="bg-[#fdfaf7] min-h-screen pb-12 font-sans">
      
      {/* --- NOVA BARRA SUPERIOR (NAVBAR) --- */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center relative z-30">
        <div className="font-bold text-[#8B4513] text-xl">Top 5 Tião Carreiro</div>
        
        <div>
          {user ? (
            // Se estiver logado, mostra o nome e opções
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">Olá, {user.name}</span>
              
              {/* Se for administrador, mostra o link para o painel */}
              {user.is_admin === 1 && (
                <Link to="/admin" className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline">
                  Painel Admin
                </Link>
              )}
              
              <button 
                onClick={handleLogout} 
                className="text-sm text-red-600 hover:text-red-800 font-semibold"
              >
                Sair
              </button>
            </div>
          ) : (
            // Se NÃO estiver logado, mostra o botão de ir para o Auth
            <Link 
              to="/auth" 
              className="bg-[#8B4513] text-white px-5 py-2 rounded-md hover:bg-orange-900 transition font-semibold text-sm shadow"
            >
              Entrar / Cadastrar
            </Link>
          )}
        </div>
      </header>
      {/* ------------------------------------ */}

      <HeroSection 
        title="Top 5 Músicas Mais Tocadas"
        subtitle="Tião Carreiro & Pardinho"
        bgImage="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
        artistImage="https://images.unsplash.com/photo-1525362081669-2b476bb628c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      />
      
      <div className="px-4">
        {/* Passamos o usuário logado para o formulário para ele saber se bloqueia ou libera o envio */}
        <SuggestionForm user={user} />
        <RankingList 
          top5={top5} 
          others={others} 
          onPageChange={fetchSongs} 
          // Passamos a função para recarregar os dados na página atual
          onViewUpdate={() => fetchSongs(others?.current_page || 1)} 
        />
      </div>
    </div>
  );
}