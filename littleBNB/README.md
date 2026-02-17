# 🏠 LittleBNB

> ⚠️ **STATUS DO PROJETO: EM MANUTENÇÃO / DESENVOLVIMENTO**
>
> Este projeto é um clone funcional inspirado no Airbnb.\
> As funcionalidades principais estão operando, porém o código está
> passando por refatorações e novas features estão sendo implementadas.

------------------------------------------------------------------------

## 📖 Sobre o Projeto

O **LittleBNB** é uma aplicação Full-Stack desenvolvida com o objetivo
de replicar as principais funcionalidades da plataforma Airbnb.

A aplicação permite que usuários:

-   Criem uma conta
-   Façam login
-   Visualizem acomodações
-   Gerenciem seu perfil

O projeto foi construído como prática de arquitetura Full-Stack
utilizando a stack MERN.

------------------------------------------------------------------------

## 🚀 Tecnologias Utilizadas

O projeto foi desenvolvido utilizando a stack **MERN** e ferramentas
modernas de build e estilização.

### 🎨 Front-end

-   **React** (v19)
-   **Vite** (Build Tool)
-   **Tailwind CSS** (v4)
-   **React Router DOM**
-   **Axios**

### 🖥 Back-end

-   **Node.js**
-   **Express**
-   **MongoDB**
-   **Cookie-Parser**
-   **CORS**

------------------------------------------------------------------------

## ⚙️ Funcionalidades

Com base nas rotas atualmente implementadas:

### ✅ Implementadas

-   [x] Cadastro de Usuários (`/register`)
-   [x] Autenticação / Login (`/login`)
-   [x] Visualização de Acomodações (`/place/:id`)
-   [x] Gerenciamento de Perfil (`/account`)

### 🚧 Em Desenvolvimento

-   [ ] Sistema completo de reservas
-   [ ] Filtros avançados de busca
-   [ ] Upload e gerenciamento de imagens

------------------------------------------------------------------------

## 📦 Como Rodar o Projeto

### 🔹 Pré-requisitos

-   Node.js instalado
-   NPM ou Yarn
-   MongoDB rodando (local ou MongoDB Atlas)

------------------------------------------------------------------------

## 🔧 1. Configuração do Back-end

Navegue até a pasta do servidor:

``` bash
cd back-end
npm install
```

Crie um arquivo `.env` dentro da pasta `back-end` com as variáveis
necessárias:

``` env
PORT=4000
MONGO_URL=sua_string_de_conexao
JWT_SECRET=sua_chave_secreta
```

Para iniciar o servidor:

``` bash
npm start
# ou
node index.js
```

O servidor rodará na porta definida no `.env` (padrão: 4000).

------------------------------------------------------------------------

## 💻 2. Configuração do Front-end

Em outro terminal, navegue até a pasta do cliente:

``` bash
cd front-end
npm install
```

Crie um arquivo `.env` dentro da pasta `front-end`:

``` env
VITE_AXIOS_BASE_URL=http://localhost:4000
```

Para iniciar o front-end:

``` bash
npm run dev
```

------------------------------------------------------------------------

## 🏗 Estrutura Geral

 LittleBNB/
│
├── back-end/
│   ├── config/
│   │   └── db.js
│   │
│   ├── domains/
│   │   ├── bookings/
│   │   │   ├── model.js
│   │   │   └── routes.js
│   │   │
│   │   ├── places/
│   │   │   ├── model.js
│   │   │   └── routes.js
│   │   │
│   │   └── users/
│   │       ├── model.js
│   │       └── routes.js
│   │
│   ├── routes/
│   │   └── index.js
│   │
│   ├── utils/
│   ├── tmp/
│   ├── .env
│   ├── index.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── front-end/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AccBookings.jsx
│   │   │   ├── AccPlaces.jsx
│   │   │   ├── AccProfile.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Item.jsx
│   │   │   ├── NewPlace.jsx
│   │   │   ├── Perk.jsx
│   │   │   ├── Perks.jsx
│   │   │   └── PhotoUploader.jsx
│   │   │
│   │   ├── contexts/
│   │   │   └── UserContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Account.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Place.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .gitignore
│
└── README.md


------------------------------------------------------------------------

## 📌 Objetivo do Projeto

Este projeto foi desenvolvido com foco em:

-   Aprendizado de arquitetura Full-Stack
-   Autenticação com cookies/JWT
-   Integração Front-end ↔ Back-end
-   Estruturação profissional de projeto

------------------------------------------------------------------------

## 🤝 Contribuição

Como o projeto está em fase de aprendizado e evolução, sugestões são
bem-vindas.

Sinta-se à vontade para:

-   Abrir uma issue
-   Enviar um pull request
-   Sugerir melhorias de arquitetura

------------------------------------------------------------------------

## 👨‍💻 Autor

Desenvolvido por **Diogo dos Reis Lago**
