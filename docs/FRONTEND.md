# Frontend CATEC

## Projeto oficial

| Item | Valor |
|------|--------|
| Pasta | `catec-frontend/` |
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
cd catec-frontend
cp .env.example .env
```

Variáveis mínimas para desenvolvimento:

| Variável | Exemplo |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` |
| `NEXTAUTH_SECRET` | string aleatória (32+ caracteres) |
| `NEXTAUTH_URL` | `http://localhost:3000/api/auth` |

Menus demo do template Vuexy ficam ocultos por padrão. Para exibir: `NEXT_PUBLIC_SHOW_VUEXY_DEMOS=true`.

### Problemas comuns

**`NO_SECRET` / `JWT_SESSION_ERROR` / `decryption operation failed`**

1. Confirme que existe `catec-frontend/.env` (não vai no Git — ao mover a pasta, copie de novo: `cp .env.example .env`).
2. `NEXTAUTH_SECRET` não pode estar vazio.
3. Limpe cookies de `localhost:3000` no browser (sessão NextAuth ou cookie antigo do template Vuexy).
4. Reinicie o dev server após criar/editar o `.env`.

**`Turbopack Error` / crash ao abrir rotas CATEC**

O `pnpm dev` usa **Webpack** por defeito. Evite `pnpm dev:turbo` neste projeto (Turbopack instável no Mac com este template). Se mudou de pasta:

```bash
rm -rf .next
pnpm dev
```

**Redireciona para `/en/dashboards/crm`**

Cookie antigo do template Vuexy. Limpe cookies de `localhost:3000` ou abra janela anónima e use `/pt/catec/projetos`.

## Executar

```bash
pnpm install
pnpm dev
```

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

## Cutover (Fase 4D)

| Subetapa | Estado |
|----------|--------|
| Redirects produção (`/` → `/pt/catec/projetos`) | Concluído |
| Ocultar menus demo Vuexy (`NEXT_PUBLIC_SHOW_VUEXY_DEMOS`) | Concluído |
| Portar e2e smoke Playwright | Concluído |
| Renomear para `catec-frontend/` + docs | Concluído |
