# CATEC — sistema de gestão de fluxo

Repositório com **`catec-backend`** (Java / Spring Boot), **`catec-frontend`** (Next.js — frontend oficial) e **PostgreSQL** para desenvolvimento local via Docker Compose.

Pastas de análise, planos, tarefas e documentação comercial/técnica detalhada ficam em **`Analise Projeto/`** no seu computador e **não entram no Git** (ver `.gitignore`).

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) (Compose v2)
- [Java 17+](https://adoptium.net/) (JDK na variável `JAVA_HOME`; obrigatório para o Maven Wrapper)
- Opcional: Maven instalado globalmente — o projeto inclui **`mvnw` / `mvnw.cmd`**, que baixam o Maven 3.9.x e evitam conflito com instalações antigas
- [Node.js 20+](https://nodejs.org/) e [pnpm](https://pnpm.io/) (frontend oficial)

## Variáveis de ambiente

Cada projeto tem seu próprio `.env`:

| Projeto | Arquivo | Uso |
|---------|---------|-----|
| **Raiz** | `.env` | Docker Compose (PostgreSQL) |
| **Backend** | `catec-backend/.env` | Spring Boot (banco, e-mail, JWT) |
| **Frontend** | `catec-frontend/.env` | Next.js (NextAuth, URL da API) |

```bash
# Raiz — só infra Docker
cp .env.example .env

# Backend
cp catec-backend/.env.example catec-backend/.env

# Frontend
cp catec-frontend/.env.example catec-frontend/.env
```

Ajuste senhas em desenvolvimento; **não** faça commit dos arquivos `.env`.

O `docker-compose.yml` na raiz lê `POSTGRES_*` do `.env` local (o Compose carrega automaticamente).

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

Com o Postgres rodando e `catec-backend/.env` configurado:

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

A API sobe por padrão em **http://localhost:8080**. Endpoints públicos: **`GET /api/v1/health-check`**, **`POST /api/v1/auth/login`**, **`GET /actuator/health`**. Com JWT válido: **`GET /api/v1/me`** (dados do usuário, grupos e permissões) e exemplo protegido **`GET /api/v1/demo/ping`**.

### Documentação OpenAPI (Swagger) — perfil `dev`

Com o backend em execução e **`SPRING_PROFILES_ACTIVE=dev`** (padrão local):

- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) (atalho: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html))
- **Spec JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

A UI e o spec ficam **desabilitados** fora do perfil `dev` (`application.yml`). Tags no Swagger: **Auth**, **Clientes**, **Projetos**, **Propostas**, **Documentos**, **Usuários**, **Sessão**, **Sistema**, **Painel**. Versão da API no spec: **1.0.0**. Use **Authorize** com o token de `POST /api/v1/auth/login` (`Bearer <accessToken>`).

**Gestão de usuários (task_005):** rotas sob **`/api/v1/admin/usuarios`**, restritas à permissão **`acao.usuario.gerir`** (HTTP **403** caso contrário). Operações: **`GET`** listagem; **`GET /{id}`** detalhe; **`POST`** criação (corpo com `nome`, `email`, `telefone` opcional, `grupos` como lista de códigos, ex.: `["COLABORADOR","ADMINISTRATIVO"]`); **`PUT /{id}`** atualização (mesmos campos). Regras: e-mail único; não é permitido desativar a própria conta nem remover o próprio grupo `ADMINISTRATIVO`. Testes unitários do serviço: `AdminUsuarioServiceTest`. Regressão manual rápida: login como `admin@catec.local`, chamar `GET /api/v1/admin/usuarios` com `Authorization: Bearer <token>` e verificar **200**; com token inválido, **401**; sem permissão (ex.: colaborador sem `acao.usuario.gerir`), **403**.

### Autenticação (JWT)

- **Modelo:** API **stateless** com **JWT** no cabeçalho `Authorization: Bearer <token>` (não sessão HTTP).
- **Login:** `POST /api/v1/auth/login` com corpo JSON `{ "email": "...", "password": "..." }`. Resposta: `{ "tokenType": "Bearer", "accessToken": "...", "expiresInSeconds": ... }`.
- **Segredo e duração:** variáveis `JWT_SECRET` (mínimo **32 caracteres** para HS256) e opcional `JWT_EXPIRATION_MINUTES` (ver `application.yml`).
- **Usuários de desenvolvimento** (migração `V2__seed_usuarios_dev.sql`): `admin@catec.local` / senha **`password`** (perfil `ADMINISTRATIVO`); `inativo@catec.local` / **`password`** — conta **inativa** (não deve autenticar).
- **Grupos de acesso** (migrações `V27__grupos_acesso.sql`, `V28__drop_usuario_perfil.sql`): catálogo de permissões (telas/ações), grupos padrão e API `GET/POST/PUT/DELETE /api/v1/admin/grupos` (requer permissão `acao.grupo.gerir`). `GET /api/v1/me` retorna `grupos` e `permissoes`. A tabela legada `usuario_perfil` foi removida — vínculos ficam em `usuario_grupo`.
- **CORS:** em `dev`, origens `http://localhost:3000` e `http://127.0.0.1:3000` (Next.js). O frontend legado Vite (`:5173`) foi descontinuado.

Erros tratados pelo handler global devolvem JSON com `status`, `mensagem`, `timestamp` e `path`.

### Conexão do backend com o banco

O Spring Boot usa `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`. Em desenvolvimento local, o URL JDBC típico é `jdbc:postgresql://localhost:<POSTGRES_PORT>/<POSTGRES_DB>`.

### Migrações do banco (Flyway)

- Scripts SQL em **`catec-backend/src/main/resources/db/migration/`**, com nome **`V{versão}__descricao.sql`** (ex.: `V1__usuario_perfil_cliente.sql`).
- Ao **iniciar o backend** com Postgres acessível, o Flyway roda **antes** do JPA e aplica só migrações ainda não registradas na tabela `flyway_schema_history` — **executar a aplicação de novo não duplica** tabelas nem objetos já aplicados.
- **Banco vazio:** a primeira subida aplica `V1` e cria o schema combinado.
- **Novas alterações:** crie sempre um arquivo com **versão maior** (`V2__...`, `V3__...`); **não edite** migrações já aplicadas em ambientes compartilhados (o Flyway valida checksums).
- **Começar do zero (só dev local):** `docker compose down -v` apaga o volume do Postgres; no próximo `docker compose up` o Flyway volta a aplicar desde o `V1`.

### Documentos (upload / download)

- Metadados na tabela `documento` (`V15__documento.sql`); bytes em storage configurável (disco local em dev: `catec-backend/storage/documentos/`, ignorado pelo Git).
- API autenticada (`COLABORADOR`, `ADMINISTRATIVO` ou `SOCIO`): `POST /api/v1/documentos` (multipart: `tipoVinculo`, `vinculoId`, `file`, `tipoArquivo` opcional — **não** usar `PROPOSTA` aqui), `GET /api/v1/documentos/{id}`, `GET /api/v1/documentos/{id}/conteudo`.
- **Autorização por vínculo:** `ADMINISTRATIVO` acede a qualquer documento; `COLABORADOR` a `PROJETO` que criou; `SOCIO` lê documentos de `PROPOSTA`; upload de `PROPOSTA` só via endpoint aninhado (abaixo).

### Proposta comercial (API)

- Tabelas `proposta` (`V17`) e `auditoria_fluxo` (`V16`).
- Base: `/api/v1/projetos/{projetoId}/propostas` — perfis `COLABORADOR`, `ADMINISTRATIVO`, `SOCIO` (leitura conforme projeto; transições por perfil no serviço).
- `POST /` — criar (`requerAvaliacaoSocio` no body; só `ADMINISTRATIVO`).
- `GET /`, `GET /{propostaId}` — listar / detalhe.
- Transições (`POST`): `/{id}/submeter-avaliacao-socio`, `/{id}/aprovar-interna` (ADM), `/{id}/aprovar-socio`, `/{id}/devolver-rascunho` (Sócio), `/{id}/enviar-cliente` (ADM).
- Anexos: `GET|POST /{propostaId}/documentos` (upload só ADM, estados `RASCUNHO` / `PENDENTE_AVALIACAO_SOCIO` / `APROVADA_INTERNA`); download pelo `GET /api/v1/documentos/{id}/conteudo`.
- Resposta do cliente (registro interno ADM): `GET|POST /{propostaId}/interacoes` (`CONSIDERACOES_CLIENTE`, `ACEITE_CLIENTE`, `RECUSA_CLIENTE`).
- Fila sócio: `GET /api/v1/socio/propostas/pendentes`, `POST /api/v1/socio/propostas/{propostaId}/aprovar`, `POST .../devolver` (parecer obrigatório na devolução).

### Painel (API — task_015)

Somente leitura; perfis `COLABORADOR`, `ADMINISTRATIVO`, `SOCIO` (colaborador vê só projetos que criou).

- `GET /api/v1/painel/resumo` — projetos paginados com **fase macro** (proposta de maior versão tem prioridade sobre `projeto.status`). Query: `clienteId`, `status` (enum fase macro), `prazoAte` (ISO-8601, filtra `atualizado_em ≤ prazoAte`), `page`, `size`.
- `GET /api/v1/painel/indicadores` — contadores: pendentes de cliente, propostas aguardando registro do cliente, aguardando sócio, aprovadas aguardando envio, em rascunho.
- `GET /api/v1/painel/projetos/{id}/historico` — união paginada de `auditoria_fluxo` (projeto + propostas) e `interacao_fluxo` (propostas), ordenada por data descendente.

Regra de fase macro documentada em `FaseMacro` / `FaseMacroResolver` no backend.

### Painel de visibilidade (frontend)

- A **API** do painel (`GET /api/v1/painel/*`) está documentada acima.
- A **UI do painel** ainda não foi portada para o `catec-frontend`; use a API diretamente.

### Frontend — fluxo comercial (UI oficial)

Rotas no **`catec-frontend`**:

- Login: `/login` — troca de senha obrigatória: `/catec/definir-senha`
- Projetos: `/catec/projetos`, detalhe `/catec/projetos/{id}` (proposta, contrato, interações, histórico)
- Clientes: `/catec/clientes`
- Usuários: `/catec/usuarios`
- Grupos: `/catec/grupos`

Fila do sócio (`/app/socio/propostas` no legado) **fora de escopo** desta migração.

Limites em `application.yml` (`app.documento.max-size-bytes`, `app.documento.allowed-mime-types`); variáveis opcionais: `APP_DOCUMENTO_MAX_BYTES`, `APP_DOCUMENTO_STORAGE_DIR`, `APP_DOCUMENTO_STORAGE_TYPE`.

## Executar o frontend

Documentação detalhada: **[docs/FRONTEND.md](docs/FRONTEND.md)**.

```bash
cd catec-frontend
cp .env.example .env
```

Preencha pelo menos `NEXTAUTH_SECRET` (ex.: `openssl rand -base64 32`) e confirme `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`.

```bash
pnpm install
pnpm dev
```

- **URL:** http://localhost:3000 (redirect `/` → `/catec/projetos`)
- **Login:** http://localhost:3000/login
- **Credenciais dev:** `admin@catec.local` / `password`
- **Menu:** itens CATEC conforme permissões `tela.*` em `GET /api/v1/me`
- **Logo:** `catec-frontend/public/images/logo-catec.png`

**Autenticação:** NextAuth (credenciais) + JWT da API CATEC na sessão. Guards `AuthGuard`, `RequireCatecPermission` e `CanPermission` no React; a API continua a validar JWT e permissões em cada operação.

**Testes smoke (Playwright):** `pnpm test:e2e` na pasta do frontend (requer `NEXTAUTH_SECRET` no `.env`).

> **Após mover a pasta:** copie o `.env` de novo, rode `rm -rf .next` e limpe cookies de `localhost:3000`. Ver [docs/FRONTEND.md](docs/FRONTEND.md#problemas-comuns).

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

**Frontend (versionado no Git):** [docs/FRONTEND.md](docs/FRONTEND.md)
