const cmd = process.argv[2] ?? 'dev'

console.error(`
[catec-frontend] DESCONTINUADO — o comando "${cmd}" não está disponível.

Use o frontend oficial:
  cd novo-front/novo-catec-frontend
  pnpm dev --webpack

Documentação: docs/FRONTEND.md
`)

process.exit(1)
