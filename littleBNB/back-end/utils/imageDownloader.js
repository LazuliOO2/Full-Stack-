import download from "image-downloader";
import mime from "mime-types"; // Se certifique que isso está importado

export const downloadImage = async (link, destination) => {
  // ... código anterior de verificação do mimeType ...
  const mimeType = mime.lookup(link);
  // Obs: Se o link não tiver extensão (ex: unsplash), o mime.lookup pode falhar. 
  // O ideal é tentar baixar mesmo assim ou tratar erros, mas vamos focar no 403 agora.
  
  // Se o mimeType for false, tente forçar uma extensão padrão ou extrair do header, 
  // mas para o teste, vamos assumir que funcionou ou usar 'jpg' como fallback.
  const extension = mimeType ? mime.extension(mime.contentType(mimeType)) : 'jpg';

  const filename = `${Date.now()}.${extension}`;
  const fullPath = `${destination}${filename}`;

  try {
    const options = {
      url: link,
      dest: fullPath,
      // ADICIONE ESTE BLOCO DE HEADERS:
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    await download.image(options);

    return filename;

  } catch (error) {
    console.error("Erro ao baixar imagem:", error); // Melhorar o log para ver o erro real
    throw error;
  }
};