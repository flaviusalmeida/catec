# catec-frontend (descontinuado)

Este projeto **não é mais o frontend oficial** do CATEC.

A partir da migração para Vuexy / Next.js (Fase 4D), use:

**[`novo-front/novo-catec-frontend/`](../novo-front/novo-catec-frontend/)**

```bash
cd novo-front/novo-catec-frontend
cp .env.example .env   # preencha NEXTAUTH_SECRET
pnpm install
pnpm dev --webpack
```

App em **http://localhost:3000** (login: `/pt/login`, área CATEC: `/pt/catec/projetos`).

## Por que este código permanece no repositório?

- Referência histórica da migração React + Vite → Next.js + MUI
- Comparação de testes e2e (legado vs `novo-catec-frontend/e2e/`)
- Consulta pontual durante revisão de PRs antigos

## Scripts

`dev`, `build` e `preview` estão **bloqueados** de propósito. Os testes (`npm run test`) ainda podem ser executados para consulta.

Documentação geral do monorepo: [README.md](../README.md) e [docs/FRONTEND.md](../docs/FRONTEND.md).
