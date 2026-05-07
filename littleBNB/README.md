# 🏠 LittleBNB

<p align="center">
  Clone Full-Stack inspirado no Airbnb utilizando MERN Stack.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange">
  <img src="https://img.shields.io/badge/Node.js-Backend-green">
  <img src="https://img.shields.io/badge/React-Frontend-blue">
  <img src="https://img.shields.io/badge/MongoDB-Database-brightgreen">
  <img src="https://img.shields.io/badge/License-MIT-lightgrey">
</p>

---

# 📖 Sobre o Projeto

O **LittleBNB** é uma aplicação Full-Stack inspirada na plataforma Airbnb, desenvolvida com foco em:

- Arquitetura escalável
- Organização modular
- Segurança de APIs
- Testes de carga
- Boas práticas de desenvolvimento Full-Stack

A aplicação permite que usuários:

- Criem contas
- Realizem autenticação
- Visualizem acomodações
- Gerenciem perfil
- Criem reservas

O projeto foi desenvolvido como prática profissional utilizando a stack **MERN**.

---

# 🚀 Tecnologias Utilizadas

## 🎨 Front-end

- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- Axios

---

## 🖥 Back-end

- Node.js
- Express
- MongoDB
- Mongoose
- Cookie Parser
- CORS
- JWT Authentication

---

## 🔒 Segurança e Performance

O projeto também implementa:

- Middleware de autenticação
- Proteção de rotas
- Rate Limit para evitar abuso da API
- Estrutura modularizada
- Validação de requisições
- Testes de carga utilizando K6

---

# ⚙️ Funcionalidades

## ✅ Implementadas

- [x] Cadastro de usuários
- [x] Login com autenticação JWT
- [x] Cookies HTTP Only
- [x] Visualização de acomodações
- [x] Página individual de acomodação
- [x] Sistema de perfil
- [x] Criação de reservas
- [x] Middleware de autenticação
- [x] Rate Limiting
- [x] Testes de carga

---

## 🚧 Em Desenvolvimento

- [ ] Upload de imagens
- [ ] Sistema avançado de reservas
- [ ] Busca com filtros
- [ ] Paginação
- [ ] Cache
- [ ] Deploy em cloud

---

# 🧠 Arquitetura do Projeto

O projeto utiliza arquitetura modular baseada em domínio:

```text
Domain Driven Structure

domains/
 ├── users/
 ├── places/
 └── bookings/
```

Cada domínio possui:

- Model
- Routes
- Regras de negócio isoladas

Isso facilita:

- manutenção
- escalabilidade
- separação de responsabilidades

---

# 📦 Como Rodar o Projeto

# 🔹 Pré-requisitos

Antes de iniciar:

- Node.js instalado
- MongoDB local ou Atlas
- Git instalado

---

# 🔧 Configuração do Back-end

Entre na pasta do servidor:

```bash
cd back-end
npm install
```

Crie um arquivo `.env`:

```env
PORT=4000

MONGO_URL=sua_conexao_mongodb

JWT_SECRET=sua_chave_secreta
```

Inicie o servidor:

```bash
npm start
```

ou

```bash
node index.js
```

Servidor rodando:

```text
http://localhost:4000
```

---

# 💻 Configuração do Front-end

Entre na pasta do front-end:

```bash
cd front-end
npm install
```

Crie um `.env`:

```env
VITE_AXIOS_BASE_URL=http://localhost:4000
```

Inicie:

```bash
npm run dev
```

Aplicação:

```text
http://localhost:5173
```

---

# 🧪 Testes de Carga

O projeto possui testes de carga utilizando **K6**.

Objetivos dos testes:

- Simular múltiplos usuários
- Verificar estabilidade da API
- Avaliar performance
- Testar Rate Limit
- Identificar gargalos

Exemplo de execução:

```bash
k6 run tests/bookings.js
```

---

# 🔒 Middleware de Rate Limit

Foi implementado middleware de proteção contra abuso de requisições.

Exemplo:

- Proteção contra spam
- Redução de ataques de força bruta
- Controle de requisições excessivas

---

# 🗂 Estrutura do Projeto

```text
LittleBNB/
│
├── back-end/
│   ├── config/
│   │   └── db.js
│   │
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── rateLimit.js
│   │
│   ├── tests/
│   │   ├── bookings.js
│   │   └── places.js
│   │
│   ├── domains/
│   │   ├── bookings/
│   │   ├── places/
│   │   └── users/
│   │
│   ├── routes/
│   │   └── index.js
│   │
│   ├── utils/
│   ├── tmp/
│   ├── server.js
│   ├── index.js
│   └── package.json
│
├── front-end/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 📈 Objetivos Técnicos do Projeto

Este projeto foi criado para aprofundar conhecimentos em:

- APIs REST
- Arquitetura Full-Stack
- MongoDB
- Autenticação JWT
- Middlewares
- Segurança de APIs
- Testes de carga
- Organização escalável de código

---

# 🛠 Possíveis Melhorias Futuras

- Docker
- CI/CD
- Redis Cache
- Upload em Cloudinary
- Logs centralizados
- Testes automatizados
- WebSockets
- Kubernetes
- Microsserviços

---

# 🤝 Contribuição

Sugestões e melhorias são bem-vindas.

Você pode:

- Abrir Issues
- Criar Pull Requests
- Reportar bugs
- Sugerir melhorias

---

# 👨‍💻 Autor

Desenvolvido por **Diogo dos Reis Lago**

- LinkedIn: SEU_LINK
- GitHub: SEU_GITHUB

---

# 📄 Licença

Este projeto está sob a licença MIT.