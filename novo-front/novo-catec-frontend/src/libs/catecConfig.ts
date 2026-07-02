/** Base URL da API Spring Boot CATEC (mesmo contrato do `catec-frontend`). */
export const CATEC_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
).replace(/\/$/, '')
