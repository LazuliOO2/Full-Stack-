import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../lib/api';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '../lib/youtube';

export default function SuggestionForm({ user }) {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const videoId = extractYouTubeVideoId(link);
  const hasTypedLink = link.trim().length > 0;
  const showInvalidLinkFeedback = hasTypedLink && !videoId;
  const previewThumbnailUrl = getYouTubeThumbnailUrl(videoId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    // Pegamos a chave do cofre para provar para a API que estamos logados
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Você precisa estar logado para sugerir uma música.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/songs'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Aqui está a mágica: enviamos o token no cabeçalho de Autorização!
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: title,
          youtube_link: link
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Música sugerida com sucesso! Ela aparecerá no ranking após aprovação.');
        setLink('');
        setTitle('');
      } else {
        setError(data.message || 'Erro ao enviar a sugestão.');
      }
    } catch {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Se o usuário NÃO estiver logado, escondemos o form e mostramos um aviso
  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-[-40px] relative z-20 max-w-3xl mx-auto mb-12 text-center">
        <h2 className="text-xl font-bold text-[#8B4513] mb-2">Sugerir Nova Música</h2>
        <p className="text-gray-600 mb-4 font-medium">Você precisa estar conectado para enviar novas sugestões de músicas.</p>
        <Link to="/auth" className="bg-[#8B4513] text-white px-6 py-2 rounded hover:bg-orange-900 transition-colors font-semibold inline-block">
          Fazer Login para Sugerir
        </Link>
      </div>
    );
  }

  // Se estiver logado, mostra o formulário completo
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-[-40px] relative z-20 max-w-3xl mx-auto mb-12">
      <h2 className="text-xl font-bold text-[#8B4513] mb-4 border-b pb-2">Sugerir Nova Música</h2>
      
      {message && <p className="text-sm text-green-600 font-bold mb-4 bg-green-50 p-2 rounded">{message}</p>}
      {error && <p className="text-sm text-red-600 font-bold mb-4 bg-red-50 p-2 rounded">{error}</p>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome da Música"
            required
            className="flex-[1] border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Cole aqui o link do YouTube"
            required
            className="flex-[2] border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#8B4513] text-white px-6 py-2 rounded hover:bg-orange-900 transition-colors font-semibold disabled:opacity-70 whitespace-nowrap"
          >
            {isLoading ? 'Enviando...' : 'Enviar Link'}
          </button>
        </div>

        {showInvalidLinkFeedback && (
          <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded">
            Cole um link válido do YouTube para visualizar a prévia antes de enviar.
          </p>
        )}

        {videoId && (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700">Prévia do vídeo</p>
              <p className="text-xs text-gray-500">Thumbnail gerada a partir do link informado.</p>
            </div>
            <div className="p-4">
              <img
                src={previewThumbnailUrl}
                alt="Thumbnail do vídeo sugerido"
                className="w-full rounded-md border border-gray-200 object-cover"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
