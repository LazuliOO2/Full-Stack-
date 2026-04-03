import { useState, useEffect, useEffectEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../lib/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('songs'); // Controla a aba ativa
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]); // Estado para os usuários
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = loggedUser?.is_admin === true || loggedUser?.is_admin === 1;
  const pendingSongsCount = songs.filter((song) => song.status === 'pending').length;

  // --- FUNÇÕES DE MÚSICAS ---
  const fetchAdminSongs = async () => {
    try {
      const response = await fetch(apiUrl('/api/admin/songs'), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (response.ok) setSongs(await response.json());
    } catch {
      setError('Erro ao buscar as músicas.');
    }
  };

  const updateSongStatus = async (id, newStatus) => {
    await fetch(apiUrl(`/api/songs/${id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    fetchAdminSongs();
  };

  const deleteSong = async (id) => {
    if (!window.confirm('Excluir esta música?')) return;
    await fetch(apiUrl(`/api/songs/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAdminSongs();
  };

  const editSong = async (id, currentTitle, currentLink) => {
    const newTitle = window.prompt('Novo título:', currentTitle);
    const newLink = window.prompt('Novo link:', currentLink);
    if (!newTitle || !newLink) return;

    await fetch(apiUrl(`/api/songs/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle, youtube_link: newLink })
    });
    fetchAdminSongs();
  };

  // --- FUNÇÕES DE USUÁRIOS ---
  const fetchUsers = async () => {
    try {
      const response = await fetch(apiUrl('/api/admin/users'), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (response.ok) setUsers(await response.json());
    } catch {
      setError('Erro ao buscar usuários.');
    }
  };

  const loadAdminData = useEffectEvent(async () => {
    await Promise.all([fetchAdminSongs(), fetchUsers()]);
  });

  const toggleAdminRole = async (id) => {
    if (!window.confirm('Alterar privilégios deste usuário?')) return;
    await fetch(apiUrl(`/api/admin/users/${id}/role`), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Atenção! Deseja excluir este usuário do sistema?')) return;
    await fetch(apiUrl(`/api/admin/users/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    fetchUsers();
  };

  // --- EFEITO INICIAL ---
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate('/auth');
      return;
    }

    void loadAdminData();
  }, [isAdmin, navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-900">Painel do Administrador</h1>
            <p className="text-sm text-gray-600 mt-2">
              {pendingSongsCount > 0
                ? `${pendingSongsCount} sugest${pendingSongsCount > 1 ? 'ões pendentes aguardando revisão.' : 'ão pendente aguardando revisão.'}`
                : 'Nenhuma sugestão pendente no momento.'}
            </p>
            <Link to="/" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
              &larr; Voltar para o Site Público
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 w-full sm:w-auto"
          >
            Sair do Painel
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Abas de Navegação */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-4 py-2 font-bold rounded ${
              activeTab === 'songs'
                ? 'bg-[#8B4513] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Gerenciar Músicas
            {pendingSongsCount > 0 && (
              <span className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                activeTab === 'songs' ? 'bg-white text-[#8B4513]' : 'bg-orange-600 text-white'
              }`}>
                {pendingSongsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-bold rounded ${
              activeTab === 'users'
                ? 'bg-[#8B4513] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Gerenciar Usuários
          </button>
        </div>

        {/* ========================================= */}
        {/* ABA: MÚSICAS                */}
        {/* ========================================= */}
        {activeTab === 'songs' && (
          <div>
            {/* VIEW PARA CELULAR: Cards (Aparece apenas em telas < 768px) */}
            <div className="block md:hidden space-y-4">
              {songs.map((song) => (
                <div key={song.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-800 text-base">{song.title}</h3>
                    <div className="ml-2 flex-shrink-0">
                      {song.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">Pendente</span>}
                      {song.status === 'approved' && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Aprovada</span>}
                      {song.status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">Reprovada</span>}
                    </div>
                  </div>
                  {/* Botões ocupando a largura de forma igual (flex-1) */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {song.status === 'pending' && (
                      <>
                        <button onClick={() => updateSongStatus(song.id, 'approved')} className="flex-1 bg-green-500 text-white px-2 py-2 rounded text-xs font-bold">Aprovar</button>
                        <button onClick={() => updateSongStatus(song.id, 'rejected')} className="flex-1 bg-orange-500 text-white px-2 py-2 rounded text-xs font-bold">Reprovar</button>
                      </>
                    )}
                    <button onClick={() => editSong(song.id, song.title, song.youtube_link)} className="flex-1 bg-blue-500 text-white px-2 py-2 rounded text-xs font-bold">Editar</button>
                    <button onClick={() => deleteSong(song.id)} className="flex-1 bg-red-600 text-white px-2 py-2 rounded text-xs font-bold">Excluir</button>
                  </div>
                </div>
              ))}
            </div>

            {/* VIEW PARA PC/TABLET: Tabela Clássica (Aparece apenas em telas >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Música</th>
                    <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">Status</th>
                    <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => (
                    <tr key={song.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b text-sm font-medium text-gray-800">{song.title}</td>
                      <td className="py-3 px-4 border-b text-center">
                        {song.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">Pendente</span>}
                        {song.status === 'approved' && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Aprovada</span>}
                        {song.status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">Reprovada</span>}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center justify-center gap-2">
                          {song.status === 'pending' && (
                            <>
                              <button onClick={() => updateSongStatus(song.id, 'approved')} className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">Aprovar</button>
                              <button onClick={() => updateSongStatus(song.id, 'rejected')} className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">Reprovar</button>
                            </>
                          )}
                          <button onClick={() => editSong(song.id, song.title, song.youtube_link)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">Editar</button>
                          <button onClick={() => deleteSong(song.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* ABA: USUÁRIOS                */}
        {/* ========================================= */}
        {activeTab === 'users' && (
          <div>
            {/* VIEW PARA CELULAR: Cards */}
            <div className="block md:hidden space-y-4">
              {users.map((u) => (
                <div key={u.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-800 text-base">{u.name}</h3>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <div className="mt-2">
                      {u.is_admin ? (
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded inline-block">Administrador</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded inline-block">Usuário Comum</span>
                      )}
                    </div>
                  </div>
                  
                  {u.id !== loggedUser.id && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button 
                        onClick={() => toggleAdminRole(u.id)} 
                        className={`flex-1 px-2 py-2 rounded text-xs font-bold text-white ${u.is_admin ? 'bg-gray-500 hover:bg-gray-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                      >
                        {u.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="flex-1 bg-red-600 text-white px-2 py-2 rounded text-xs font-bold hover:bg-red-700">
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* VIEW PARA PC/TABLET: Tabela Clássica */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Nome / E-mail</th>
                    <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">Nível de Acesso</th>
                    <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b text-sm font-medium text-gray-800">
                        {u.name} <br />
                        <span className="text-gray-500 font-normal">{u.email}</span>
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        {u.is_admin ? (
                          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded">Administrador</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded">Usuário Comum</span>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {u.id !== loggedUser.id && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleAdminRole(u.id)}
                              className={`px-2 py-1 rounded text-xs font-bold text-white ${
                                u.is_admin ? 'bg-gray-500 hover:bg-gray-600' : 'bg-purple-500 hover:bg-purple-600'
                              }`}
                            >
                              {u.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-red-700"
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
