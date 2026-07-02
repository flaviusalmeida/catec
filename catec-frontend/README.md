# CATEC — frontend (Next.js / Vuexy)

Frontend oficial do sistema CATEC. Consome a API Spring Boot em `catec-backend` (`NEXT_PUBLIC_API_BASE_URL`, padrão `http://localhost:8080`).

Documentação completa: [docs/FRONTEND.md](../docs/FRONTEND.md).

## Início rápido

```bash
cp .env.example .env
# Preencha NEXTAUTH_SECRET (openssl rand -base64 32)

pnpm install
pnpm dev
```

- **Login:** http://localhost:3000/login  
- **Área autenticada:** http://localhost:3000/catec/projetos  
- **Credenciais dev:** `admin@catec.local` / `password`

Interface em português, sem prefixo `/pt` ou `/en` nas URLs.

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento (Webpack) |
| `pnpm dev:turbo` | Turbopack — evitar no Mac |
| `pnpm build` | Build de produção |
| `pnpm test:e2e` | Smoke tests Playwright |
| `pnpm clean` | Remove `.next` |
