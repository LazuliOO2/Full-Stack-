# 📌 Sistema de Gestão de Chamados

Sistema web para cadastro, listagem, consulta e acompanhamento de chamados de suporte. A aplicação permite criar chamados com prioridade, atribuir responsáveis de forma manual ou automática, filtrar registros e consultar o histórico de eventos de cada chamado.

## 🔎 Visão Geral

Este projeto resolve um problema comum em operações de suporte: centralizar chamados, distribuir demandas entre agentes ativos e manter rastreabilidade básica das alterações realizadas.

Principais funcionalidades implementadas:

- Cadastro de chamados com título, descrição, prioridade e status.
- Atribuição automática para o agente ativo com menor quantidade de chamados abertos.
- Atribuição manual para um agente ativo selecionado.
- Listagem de chamados com filtros por busca textual, status e prioridade.
- Consulta detalhada de um chamado.
- Histórico de eventos por chamado, incluindo criação, atualização e troca de responsável.
- Listagem de agentes com contagem total de chamados e contagem de chamados abertos.
- Validação, sanitização básica de descrição, proteção CSRF e rate limiting no endpoint de criação.

Tecnologias utilizadas:

- PHP 8.3
- Laravel 13
- Inertia.js
- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- PostgreSQL configurado no `.env.example`
- PHPUnit
- Larastan/PHPStan
- Laravel Pint
- ESLint e Prettier

## 🏗️ Arquitetura da Aplicação

A aplicação segue uma arquitetura monolítica baseada em Laravel, com backend e frontend no mesmo projeto. O Laravel é responsável por rotas, controllers, validação, persistência, regras de negócio, renderização inicial via Inertia e exposição dos endpoints consumidos pela interface. O frontend é construído com Vue 3, TypeScript e Inertia.js, entregando uma experiência próxima de SPA sem exigir uma API REST separada e complexa.

### Arquitetura Geral

O sistema usa o padrão MVC do Laravel com uma camada adicional de Service para encapsular regra de negócio específica. A camada de apresentação fica em `resources/js/pages/Welcome.vue`, que renderiza a tela principal de chamados e consome endpoints JSON definidos em `routes/web.php`.

O backend organiza o domínio em:

- `Controllers`: recebem requisições HTTP, acionam validação, coordenam serviços e retornam recursos JSON.
- `Requests`: centralizam autorização, sanitização e regras de validação.
- `Services`: concentram regras de negócio que não devem ficar no controller.
- `Models`: representam entidades persistidas e relacionamentos Eloquent.
- `Resources`: padronizam a estrutura das respostas JSON.
- `Migrations`: definem a estrutura das tabelas.
- `Seeders`: criam dados iniciais, como agentes de suporte.

### Fluxo de Requisição

O fluxo principal acontece da seguinte forma:

1. O usuário interage com a tela de chamados em `resources/js/pages/Welcome.vue`.
2. O Vue executa chamadas `fetch` para endpoints como `/api/tickets` e `/api/agents`.
3. As rotas em `routes/web.php` direcionam a requisição para `TicketController` ou `AgentController`.
4. Em criação e atualização de chamados, `StoreTicketRequest` e `UpdateTicketRequest` validam e sanitizam os dados.
5. O controller usa Models Eloquent e, quando necessário, o `TicketAssignmentService`.
6. O Laravel persiste ou consulta dados no banco.
7. A resposta retorna por meio de API Resources, como `TicketResource`, `AgentResource` e `TicketEventResource`.
8. O Vue atualiza a interface com os dados recebidos.

### Comunicação Frontend ↔ Backend

Embora as rotas estejam em `routes/web.php`, os endpoints de `/api/*` retornam JSON. O frontend consome essas rotas por `fetch`, sempre enviando `Accept: application/json`. Para requisições com corpo, também envia `Content-Type: application/json` e o token CSRF por `X-CSRF-TOKEN`.

Essa abordagem mantém a simplicidade de um monólito Laravel/Inertia, mas ainda separa bem a interface Vue da lógica de domínio no backend.

### Estrutura MVC do Laravel

- **Model**: `Ticket`, `Agent`, `TicketEvent` e `User` representam tabelas e relacionamentos.
- **View**: a view raiz Blade está em `resources/views/app.blade.php`, enquanto a interface principal é um componente Vue carregado via Inertia.
- **Controller**: `TicketController` e `AgentController` recebem requisições e coordenam respostas.

### Papel do Vue/Inertia

O projeto usa Vue 3 com Inertia.js, não React. O Inertia conecta a rota inicial `/` à página `Welcome`, permitindo que a aplicação carregue uma experiência rica no frontend sem criar uma camada de API separada apenas para navegação.

Na prática, a página Vue atua como a interface operacional do sistema: carrega agentes, lista chamados, aplica filtros, cria chamados e exibe detalhes com histórico.

### Organização de Pastas

A organização segue a estrutura padrão do Laravel com pastas específicas para domínio:

- `app/Http/Controllers`: entrada das requisições HTTP.
- `app/Http/Requests`: validação e preparação dos dados.
- `app/Http/Resources`: transformação de Models em respostas JSON.
- `app/Models`: entidades Eloquent e relacionamentos.
- `app/Services`: regras de negócio reutilizáveis.
- `database/migrations`: schema do banco de dados.
- `database/seeders`: carga inicial de dados.
- `resources/js`: aplicação Vue/TypeScript.
- `resources/css`: estilos globais.
- `routes`: definição de rotas web e console.
- `tests`: testes automatizados.

### Fluxo Controller → Service → Model → Banco de Dados

O fluxo mais importante do domínio é:

```text
Controller
→ Service
→ Model
→ Banco de Dados
```

**Controller**: recebe a requisição, aciona Form Requests, chama serviços quando há regra de negócio e retorna responses padronizadas. Exemplo: `TicketController::store()` cria o chamado, registra evento e delega atribuição automática ao serviço quando o responsável não foi informado.

**Service**: concentra regra de negócio que não pertence à camada HTTP. O `TicketAssignmentService` escolhe o agente ativo com menos chamados abertos, usando `withCount`, ordenação por carga e desempate por `id`.

**Model**: representa as entidades e seus relacionamentos. `Ticket` se relaciona com `Agent` por `assignedAgent()` e com `TicketEvent` por `events()`. Os Models também usam `$fillable` explícito e casts para datas, booleanos e JSON.

**Banco de Dados**: as migrations criam as tabelas `agents`, `tickets` e `ticket_events`, com índices em campos de filtro como `priority`, `status`, `assigned_to` e `type`.

Essa separação reduz acoplamento, facilita testes unitários e evita controllers muito grandes. Também permite evoluir regras de negócio, como distribuição de chamados, sem reescrever a camada de transporte HTTP.

## ⚙️ Decisões Técnicas

### Por que Laravel

Laravel foi escolhido por oferecer alta produtividade e uma base madura para aplicações web. O projeto aproveita recursos nativos como rotas, controllers, Form Requests, Eloquent ORM, migrations, seeders, middleware, API Resources, logs, testes e integração com filas/cache.

Além disso, o framework fornece boas práticas de segurança por padrão, como proteção CSRF em rotas web, validação estruturada, hashing de senhas no model `User`, prevenção de mass assignment por `$fillable` e APIs consistentes para acesso ao banco sem SQL concatenado.

### Por que Inertia.js

Inertia.js permite construir uma experiência de SPA mantendo a produtividade de rotas e controllers server-side. Neste projeto, a rota `/` renderiza a página Vue `Welcome`, enquanto a própria página consome endpoints JSON para as operações de chamados.

Os principais benefícios são:

- Menor complexidade do que manter backend e frontend como aplicações totalmente separadas.
- Melhor experiência de usuário com componentes Vue reativos.
- Integração natural com rotas, sessão, autenticação e CSRF do Laravel.
- Possibilidade de compartilhar dados globais pelo middleware `HandleInertiaRequests`.

### Por que PostgreSQL

O arquivo `.env.example` configura `DB_CONNECTION=pgsql`, indicando PostgreSQL como banco esperado para execução local. PostgreSQL é uma escolha adequada por confiabilidade, integridade transacional, bom desempenho em consultas relacionais, suporte robusto a índices e recursos avançados como tipos JSON.

No projeto, a tabela `ticket_events` usa coluna `json` para `metadata`, o que combina bem com PostgreSQL para armazenar informações variáveis sobre eventos, como origem e destino de uma troca de responsável.

## 🔐 Segurança

### Validação de Dados

O projeto usa Form Requests:

- `StoreTicketRequest` para criação de chamados.
- `UpdateTicketRequest` para atualização total ou parcial.

As regras validam campos obrigatórios, tamanho máximo, tipos aceitos, prioridades permitidas (`low`, `medium`, `high`), status permitidos (`open`, `closed`) e existência do agente em `agents.id` quando `assigned_to` é informado.

### Proteção CSRF

As rotas de API do projeto estão em `routes/web.php`, portanto passam pelo grupo `web` do Laravel e contam com proteção CSRF. No frontend, a função `csrfToken()` lê a meta tag `csrf-token` e envia o token em requisições com corpo por meio do header `X-CSRF-TOKEN`.

Isso protege operações como criação e atualização contra requisições forjadas vindas de outros sites.

### Rate Limiting

O endpoint `POST /api/tickets` usa o middleware:

```php
->middleware('throttle:5,1')
```

Isso limita a criação de chamados a 5 requisições por minuto por origem, reduzindo risco de abuso, flood e consumo indevido de recursos.

### Sanitização

`StoreTicketRequest` e `UpdateTicketRequest` executam `prepareForValidation()` para tratar a descrição antes da validação. O código remove blocos `<script>...</script>` e aplica `strip_tags()`.

Essa sanitização reduz risco de XSS persistente em descrições, especialmente porque a descrição cadastrada é exibida novamente na interface.

### Logs e Auditoria

O sistema registra eventos importantes com `Log::info()`:

- Chamado criado.
- Chamado atualizado.
- Responsável alterado.

Além dos logs de aplicação, o projeto persiste histórico na tabela `ticket_events`. Essa tabela registra tipo, mensagem, metadados e data do evento, permitindo rastreabilidade básica dentro do próprio domínio.

Como evolução, seria recomendado incluir identificação do usuário autenticado em cada evento, IP de origem, user agent e uma política de retenção de logs.

## 👤 Autenticação e Controle de Acesso

O projeto possui o model `User` padrão do Laravel, com senha usando cast `hashed` e campos sensíveis ocultos (`password` e `remember_token`). Também existe compartilhamento de `auth.user` no middleware `HandleInertiaRequests`.

No estado atual, porém, não há fluxo de login implementado, rotas protegidas por `auth`, telas de autenticação, tokens de API, papéis de usuário ou permissões específicas para operações de chamados.

Recomendações futuras:

- Implementar autenticação com sessão usando recursos do ecossistema Laravel.
- Proteger rotas de chamados com middleware `auth`.
- Criar papéis como `admin`, `agent` e `requester`, caso o escopo do produto exija.
- Aplicar Policies ou Gates para restringir criação, edição, fechamento e visualização de chamados.
- Registrar `user_id` em `ticket_events` para auditoria completa.

## 🚀 Escalabilidade Futura

A base atual é adequada para um sistema monolítico simples, mas pode evoluir sem romper a arquitetura.

Possíveis evoluções:

- **Cache com Redis**: armazenar consultas frequentes, contadores de agentes e dados auxiliares.
- **Filas (Queues)**: processar notificações, auditorias pesadas e integrações externas de forma assíncrona.
- **Processamento assíncrono**: mover tarefas demoradas para jobs, mantendo respostas HTTP rápidas.
- **Balanceamento de carga**: executar múltiplas instâncias da aplicação atrás de um load balancer.
- **Containers**: empacotar aplicação, banco e serviços auxiliares com Docker para padronizar ambientes.
- **Microsserviços**: considerar apenas se o domínio crescer a ponto de justificar separação por contexto, como atendimento, notificações e relatórios.

O próprio `composer.json` já possui script de desenvolvimento que executa servidor Laravel, fila, logs e Vite em paralelo, o que facilita a evolução para processamento assíncrono.

## 🔮 Funcionalidades Futuras

### Notificações

O projeto ainda não implementa notificações. Melhorias possíveis:

- Envio de e-mail quando um chamado for criado, atualizado ou atribuído.
- Notificações internas para agentes responsáveis.
- WebSockets ou broadcasting para atualizar a lista de chamados em tempo real.
- Integração com canais externos, como Slack, Teams ou ferramentas de service desk.

### Histórico e Auditoria

O histórico básico já existe com `TicketEvent`. Como evolução, ele poderia registrar:

- Usuário responsável pela ação.
- Campos alterados antes e depois.
- IP e user agent.
- Eventos de autenticação.
- Exportação de trilha de auditoria.

## 📈 SLA e Disponibilidade

O projeto não possui módulo de SLA implementado. Atualmente, os chamados têm `opened_at`, `status` e `priority`, que podem servir como base para regras futuras.

Recomendações para evolução:

- Definir metas de atendimento por prioridade.
- Calcular prazo de resposta e resolução.
- Criar alertas para chamados próximos do vencimento.
- Monitorar aplicação com logs centralizados, métricas e health check em `/up`.
- Configurar backups automáticos do banco PostgreSQL.
- Definir estratégia de recuperação de falhas com restore testado periodicamente.
- Usar filas para evitar perda de notificações e tarefas assíncronas.

## 📁 Estrutura de Pastas

Árvore baseada na estrutura real do projeto, omitindo dependências e arquivos gerados:

```text
.
├── .github/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AgentController.php
│   │   │   ├── Controller.php
│   │   │   └── TicketController.php
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php
│   │   ├── Requests/
│   │   │   ├── StoreTicketRequest.php
│   │   │   └── UpdateTicketRequest.php
│   │   └── Resources/
│   │       ├── AgentResource.php
│   │       ├── TicketEventResource.php
│   │       └── TicketResource.php
│   ├── Models/
│   │   ├── Agent.php
│   │   ├── Ticket.php
│   │   ├── TicketEvent.php
│   │   └── User.php
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   └── Services/
│       └── TicketAssignmentService.php
├── bootstrap/
│   ├── app.php
│   └── providers.php
├── config/
├── database/
│   ├── factories/
│   │   └── UserFactory.php
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   ├── 2026_06_11_000003_create_agents_table.php
│   │   ├── 2026_06_11_000004_create_tickets_table.php
│   │   └── 2026_06_11_000005_create_ticket_events_table.php
│   └── seeders/
│       ├── AgentSeeder.php
│       └── DatabaseSeeder.php
├── public/
├── resources/
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   ├── app.ts
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   └── Welcome.vue
│   │   └── types/
│   └── views/
│       └── app.blade.php
├── routes/
│   ├── console.php
│   └── web.php
├── storage/
├── tests/
│   ├── Feature/
│   │   ├── AgentHttpTest.php
│   │   ├── CreateTicketTest.php
│   │   ├── ExampleTest.php
│   │   ├── ListTicketsTest.php
│   │   └── UpdateTicketTest.php
│   ├── Unit/
│   │   ├── ExampleTest.php
│   │   └── TicketAssignmentServiceTest.php
│   └── TestCase.php
├── artisan
├── composer.json
├── package.json
├── phpstan.neon
├── phpunit.xml
├── pint.json
├── tsconfig.json
└── vite.config.ts
```

## ▶️ Como Executar o Projeto

### Pré-requisitos

- PHP 8.3 ou superior
- Composer
- Node.js e npm
- PostgreSQL
- Extensões PHP necessárias para Laravel e PostgreSQL, como `pdo_pgsql`

### Instalação

```bash
composer install
npm install
```

### Configuração

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Gere a chave da aplicação:

```bash
php artisan key:generate
```

Configure o banco no `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=postgres
DB_PASSWORD=
```

### Migrações e Seeders

```bash
php artisan migrate --seed
```

O seeder cria agentes iniciais para permitir a atribuição de chamados.

### Execução em Desenvolvimento

Para executar backend, fila, logs e Vite em paralelo:

```bash
composer run dev
```

Também é possível executar manualmente em terminais separados:

```bash
php artisan serve
npm run dev
```

### Build de Produção

```bash
npm run build
```

## 🧪 Testes

O projeto possui testes de Feature e Unit cobrindo os principais comportamentos do domínio.

Testes existentes:

- Criação de chamados com validação, sanitização, atribuição automática, logs e rate limiting.
- Criação com atribuição manual.
- Listagem de chamados com resources.
- Filtros por busca, status e prioridade.
- Exibição de detalhes e histórico.
- Atualização de chamados e registro de alteração de responsável.
- Listagem de agentes com contadores.
- Regra unitária de atribuição automática para o agente ativo com menos chamados abertos.

Executar a suíte principal:

```bash
php artisan test
```

Executar o fluxo configurado no Composer, incluindo lint, análise estática e testes:

```bash
composer test
```

Outros comandos úteis:

```bash
composer lint
composer types:check
npm run lint:check
npm run format:check
npm run types:check
```

## ✅ Considerações Finais

O projeto demonstra uma base consistente para uma aplicação de suporte com Laravel, Inertia e Vue. As principais boas práticas adotadas são separação entre controller, service e model, uso de Form Requests para validação, Resources para padronização de resposta, relacionamentos Eloquent claros, migrations versionadas, testes automatizados e mecanismos básicos de segurança.

Como próximos passos técnicos, os pontos de maior impacto seriam autenticação, controle de permissões, auditoria vinculada a usuários, notificações, regras de SLA e uso de filas/cache para melhorar escalabilidade e experiência operacional.
