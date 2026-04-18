# CATEC — sistema de gestão de fluxo

Repositório com **`catec-backend`** (Java / Spring Boot), **`catec-frontend`** (React) e **PostgreSQL** para desenvolvimento local via Docker Compose.

Pastas de análise, planos, tarefas e documentação comercial/técnica detalhada ficam em **`Analise Projeto/`** no seu computador e **não entram no Git** (ver `.gitignore`).

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) (Compose v2)
- [Java 17+](https://adoptium.net/) (JDK na variável `JAVA_HOME`; obrigatório para o Maven Wrapper)
- Opcional: Maven instalado globalmente — o projeto inclui **`mvnw` / `mvnw.cmd`**, que baixam o Maven 3.9.x e evitam conflito com instalações antigas
- [Node.js 20+](https://nodejs.org/) (frontend)

## Variáveis de ambiente

Na raiz do repositório:

```bash
copy .env.example .env
```

No Linux/macOS use `cp .env.example .env`. Ajuste senhas em desenvolvimento; **não** faça commit do arquivo `.env`.

O `docker-compose.yml` lê `POSTGRES_*` do ambiente ou do arquivo `.env` na mesma pasta (o Compose carrega o `.env` automaticamente).

## Subir o PostgreSQL

Na raiz:

```bash
docker compose up -d
```

- **Porta padrão:** `5432` no host (mapeada para o container). Altere `POSTGRES_PORT` no `.env` se já existir outro serviço na 5432.
- **Banco de dados:** valor de `POSTGRES_DB` (padrão `catec`).
- **Usuário e senha:** `POSTGRES_USER` e `POSTGRES_PASSWORD` (devem ser os mesmos de `SPRING_DATASOURCE_*` no `.env`).

Verificar saúde:

```bash
docker compose ps
```

Conectar com um cliente SQL (exemplo):

```text
host=localhost port=5432 dbname=catec user=catec
```

## Executar o backend

Com o Postgres rodando e o `.env` configurado (ou variáveis exportadas no shell):

**Windows (PowerShell):** defina `JAVA_HOME` para o JDK 17+ antes de executar o wrapper.

```powershell
cd catec-backend
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
cd catec-backend
chmod +x mvnw
./mvnw spring-boot:run
```

Se preferir Maven global: `mvn spring-boot:run` (requer Maven 3.6.3+ e o mesmo JDK).

O perfil Spring ativo por padrão é **`dev`** (`application-dev.yml`, conexão com o PostgreSQL). Para outro perfil: variável `SPRING_PROFILES_ACTIVE` ou, com Maven, `-Dspring-boot.run.profiles=...`.

A API sobe por padrão em **http://localhost:8080**. Endpoints públicos: **`GET /api/v1/health-check`**, **`POST /api/v1/auth/login`**, **`GET /actuator/health`**. Com JWT válido: **`GET /api/v1/me`** (dados do usuário e lista de perfis) e exemplo protegido **`GET /api/v1/demo/ping`**.

**Gestão de usuários (task_005):** rotas sob **`/api/v1/admin/usuarios`**, restritas a JWT de usuário com perfil **`ADMINISTRATIVO`** (HTTP **403** caso contrário). Operações: **`GET`** listagem; **`GET /{id}`** detalhe; **`POST`** criação (corpo com `nome`, `email`, `senha`, `telefone` opcional, `ativo`, `perfis` como lista de enums, ex.: `["COLABORADOR","ADMINISTRATIVO"]`); **`PUT /{id}`** atualização (mesmos campos; `senha` opcional — vazia mantém a senha atual). Regras: e-mail único; não é permitido desativar a própria conta nem remover o próprio perfil `ADMINISTRATIVO`. Testes unitários do serviço: `AdminUsuarioServiceTest`. Regressão manual rápida: login como `admin@catec.local`, chamar `GET /api/v1/admin/usuarios` com `Authorization: Bearer <token>` e verificar **200**; com token inválido, **401**; sem perfil administrativo (quando existir outro usuário ativo só colaborador), **403**.

### Autenticação (JWT)

- **Modelo:** API **stateless** com **JWT** no cabeçalho `Authorization: Bearer <token>` (não sessão HTTP).
- **Login:** `POST /api/v1/auth/login` com corpo JSON `{ "email": "...", "password": "..." }`. Resposta: `{ "tokenType": "Bearer", "accessToken": "...", "expiresInSeconds": ... }`.
- **Segredo e duração:** variáveis `JWT_SECRET` (mínimo **32 caracteres** para HS256) e opcional `JWT_EXPIRATION_MINUTES` (ver `application.yml`).
- **Usuários de desenvolvimento** (migração `V2__seed_usuarios_dev.sql`): `admin@catec.local` / senha **`password`** (perfil `ADMINISTRATIVO`); `inativo@catec.local` / **`password`** — conta **inativa** (não deve autenticar).
- **CORS:** em `dev`, origens `http://localhost:5173` e `http://127.0.0.1:5173` para o React.

Erros tratados pelo handler global devolvem JSON com `status`, `mensagem`, `timestamp` e `path`.

### Conexão do backend com o banco

O Spring Boot usa `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`. Em desenvolvimento local, o URL JDBC típico é `jdbc:postgresql://localhost:<POSTGRES_PORT>/<POSTGRES_DB>`.

### Migrações do banco (Flyway)

- Scripts SQL em **`catec-backend/src/main/resources/db/migration/`**, com nome **`V{versão}__descricao.sql`** (ex.: `V1__usuario_perfil_cliente.sql`).
- Ao **iniciar o backend** com Postgres acessível, o Flyway roda **antes** do JPA e aplica só migrações ainda não registradas na tabela `flyway_schema_history` — **executar a aplicação de novo não duplica** tabelas nem objetos já aplicados.
- **Banco vazio:** a primeira subida aplica `V1` e cria o schema combinado.
- **Novas alterações:** crie sempre um arquivo com **versão maior** (`V2__...`, `V3__...`); **não edite** migrações já aplicadas em ambientes compartilhados (o Flyway valida checksums).
- **Começar do zero (só dev local):** `docker compose down -v` apaga o volume do Postgres; no próximo `docker compose up` o Flyway volta a aplicar desde o `V1`.

## Executar o frontend

```bash
cd catec-frontend
npm install
npm run dev
```

Por padrão o Vite serve em **http://localhost:5173** (porta indicada no terminal após `npm run dev`). Após o login, o app redireciona para **`/app/inicio`** (área autenticada com menu lateral no mesmo estilo visual da tela de login). O item **Usuários** aparece apenas para quem tem perfil `ADMINISTRATIVO` e consome a API acima. A **página de login** usa a paleta da marca e a logo PNG transparente em `catec-frontend/public/logo-catec.png` (cópia de `Analise Projeto/logotipos/Logo principal azul-8.png`). A API por padrão é `http://localhost:8080`; para outro host, crie `catec-frontend/.env` com `VITE_API_BASE_URL=https://...`.

## Parar o banco

```bash
docker compose down
```

Para remover também o volume com dados: `docker compose down -v` (apaga dados locais).

## Documentação local (não versionada)

Se você tiver a pasta **`Analise Projeto/`** ao lado do código (cópia interna ou arquivo zip), os caminhos típicos são:

- Especificação técnica: `Analise Projeto/docs/ESPECIFICACAO_TECNICA_CATEC.md`
- Plano de desenvolvimento: `Analise Projeto/planos/PLANO_DESENVOLVIMENTO_OFICIAL.md`
- Lista de tarefas: `Analise Projeto/tasks/`
