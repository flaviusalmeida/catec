# CATEC — frontend (Next.js / Vuexy)

Frontend oficial do sistema CATEC. Consome a API Spring Boot em `catec-backend` (`NEXT_PUBLIC_API_BASE_URL`, padrão `http://localhost:8080`).

Documentação completa do monorepo: [docs/FRONTEND.md](../../docs/FRONTEND.md).

## Início rápido

```bash
cp .env.example .env
# Preencha NEXTAUTH_SECRET (openssl rand -base64 32)

pnpm install
pnpm dev --webpack
```

- **Login:** http://localhost:3000/pt/login  
- **Área autenticada:** http://localhost:3000/pt/catec/projetos  
- **Credenciais dev:** `admin@catec.local` / `password`

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev --webpack` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm start` | Servir build |
| `pnpm test:e2e` | Smoke tests Playwright |
| `pnpm lint` | ESLint |

## Variáveis de ambiente

Ver [.env.example](./.env.example). As essenciais para CATEC:

- `NEXT_PUBLIC_API_BASE_URL` — backend Spring Boot
- `NEXTAUTH_SECRET` — obrigatório (sessão JWT NextAuth)
- `NEXTAUTH_URL` — `http://localhost:3000/api/auth` em dev
- `NEXT_PUBLIC_SHOW_VUEXY_DEMOS` — `true` só para explorar demos do template

## Estrutura CATEC

```
src/
  app/[lang]/(dashboard)/(private)/catec/   # rotas App Router
  views/catec/                              # telas
  libs/catec*Api.ts                          # cliente HTTP
  components/catec/                         # guards, menu, permissões
  e2e/                                      # smoke Playwright
```

O template Vuexy (dashboards, apps demo) permanece no código mas fica oculto no menu por padrão.
