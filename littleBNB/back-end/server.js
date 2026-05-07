import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "node:path";
import helmet from "helmet";

export const app = express();

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// 1. Configurando o Helmet para CSP e HSTS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Como você serve imagens na pasta /tmp, é bom garantir que o CSP permita imagens locais
      imgSrc: ["'self'", "data:", "http://localhost:3000"], 
      scriptSrc: ["'self'"],
      frameAncestors: ["'none'"], // Impede que o site seja aberto em iframes (Clickjacking)
      formAction: ["'self'"],     // Impede envio de formulários para domínios externos
    },
  },
  // Em produção (com HTTPS), você pode mudar para true ou remover essa linha.
  hsts:{
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
  }
}));

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/tmp", express.static(__dirname + "/tmp", {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.use(routes);

app.use((req, res, next) => {
  res.status(404).json({ error: "Recurso não encontrado" });
});


// IMPORTANTE: Este middleware DEVE ser a última coisa antes de exportar o app,
// logo depois de app.use(routes);
app.use((err, req, res, next) => {
  // Você loga o erro completo no seu terminal para poder debugar
  console.error("Erro interno:", err.stack); 
  
  // Mas para quem fez a requisição, você retorna apenas uma mensagem genérica
  res.status(500).json({ error: "Erro Interno do Servidor" }); 
});
