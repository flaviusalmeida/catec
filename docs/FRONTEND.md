# Frontend CATEC

## Projeto oficial

| Item | Valor |
|------|--------|
| Pasta | `novo-front/novo-catec-frontend/` |
| Stack | Next.js 16, React 19, MUI 7, NextAuth |
| Package manager | **pnpm** |
| URL dev | http://localhost:3000 |
| Login | `/pt/login` |
| Home pós-login | `/pt/catec/projetos` |

## Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)
- Backend Spring Boot em http://localhost:8080 (ver [README.md](../README.md))
- PostgreSQL via `docker compose up -d`

## Configuração

```bash
cd novo-front/novo-catec-frontend
cp .env.example .env
```

Variáveis mínimas para desenvolvimento:

| Variável | Exemplo |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` |
| `NEXTAUTH_SECRET` | string aleatória (32+ caracteres) |
| `NEXTAUTH_URL` | `http://localhost:3000/api/auth` |

Menus demo do template Vuexy ficam ocultos por padrão. Para exibir: `NEXT_PUBLIC_SHOW_VUEXY_DEMOS=true`.

## Executar

```bash
pnpm install
pnpm dev --webpack
```

Recomenda-se `--webpack` no macOS (Turbopack pode consumir muita RAM neste monorepo).

Build de produção:

```bash
pnpm build
pnpm start
```

## Testes e2e (smoke)

```bash
pnpm test:e2e
```

Cinco testes funcionais (auth, permissões 403/401, CRUD usuários, reset de senha) com API mockada via Playwright. Requer `NEXTAUTH_SECRET` no `.env`.

## Módulos CATEC na UI

- Projetos (lista, detalhe, propostas, contrato, interações, histórico)
- Clientes
- Usuários
- Grupos de acesso
- Login e troca de senha obrigatória

Permissões de menu e rotas seguem códigos `tela.*` / `acao.*` retornados por `GET /api/v1/me`.

## Frontend legado (`catec-frontend/`)

React + Vite — **descontinuado** em junho/2026. Scripts `dev`/`build`/`preview` bloqueados; código mantido só como referência. Ver [catec-frontend/README.md](../catec-frontend/README.md).

## Cutover (Fase 4D)

| Subetapa | Estado |
|----------|--------|
| Redirects produção (`/` → `/pt/catec/projetos`) | Concluído |
| Ocultar menus demo Vuexy (`NEXT_PUBLIC_SHOW_VUEXY_DEMOS`) | Concluído |
| Portar e2e smoke Playwright | Concluído |
| Desativar `catec-frontend` + docs | Concluído |
