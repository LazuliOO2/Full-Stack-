export default function RankingList({
  top5 = [],
  others,
  onPageChange,
  onViewUpdate,
}) {
  // Função para registrar o clique no banco de dados silenciosamente
  const handleViewClick = async (id) => {
    try {
      // 1. Envia a requisição para o banco de dados somar +1 view
      await fetch(`http://localhost:8000/api/songs/${id}/view`, {
        method: "PATCH",
        headers: { Accept: "application/json" },
      });

      // 2. Avisa o componente Home para buscar os dados atualizados silenciosamente
      if (onViewUpdate) {
        onViewUpdate();
      }
    } catch (error) {
      console.error("Erro ao contabilizar view:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-[#8B4513] mb-6 border-b pb-2">
        Ranking Atual
      </h2>

      {/* Top 5 em Destaque */}
      <div className="space-y-4 mb-8">
        {top5.map((song, index) => (
          <div
            key={song.id}
            className="flex items-center gap-4 bg-gray-50 p-4 rounded border border-gray-200"
          >
            <span className="text-3xl font-bold text-orange-600 w-8">
              {index + 1}
            </span>

            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800">{song.title}</h3>
              <p className="text-sm text-gray-500">
                {song.views} visualizações
              </p>
            </div>

            <a
              href={song.youtube_link}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleViewClick(song.id)}
              className="text-red-600 hover:text-red-800 font-semibold text-sm"
            >
              Ver no YouTube
            </a>
          </div>
        ))}
      </div>

      {/* Da 6ª música em diante (Menor destaque) */}
      {others?.data?.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-md font-semibold text-gray-600 mb-4">
            Outras Músicas
          </h3>

          <ul className="space-y-2">
            {others.data.map((song, index) => (
              <li
                key={song.id}
                className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded"
              >
                <span className="text-gray-700">
                  {others.from + index}.{" "}
                  <a
                    href={song.youtube_link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleViewClick(song.id)}
                    className="hover:text-red-600 hover:underline font-semibold"
                  >
                    {song.title}
                  </a>
                </span>

                <span className="text-gray-500">{song.views} views</span>
              </li>
            ))}
          </ul>

          {/* Paginação simples */}
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={!others.prev_page_url}
              onClick={() => onPageChange(others.current_page - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm"
            >
              Anterior
            </button>

            <span className="text-sm text-gray-500">
              Página {others.current_page} de {others.last_page}
            </span>

            <button
              disabled={!others.next_page_url}
              onClick={() => onPageChange(others.current_page + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}