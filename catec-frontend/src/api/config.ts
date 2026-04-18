/** Base URL da API (ex.: `http://localhost:8080`). Definir em `.env`: `VITE_API_BASE_URL`. */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8080";
