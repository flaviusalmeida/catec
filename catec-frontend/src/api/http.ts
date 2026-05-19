import { clearStoredAuth, getStoredToken } from "../auth/tokenStorage";
import { API_BASE_URL } from "./config";

export { getStoredToken } from "../auth/tokenStorage";

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Regista callback para 401 (ex.: logout + ir ao login). `null` remove o handler. */
export function registerUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function resolveUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

function isPublicAuthPath(path: string): boolean {
  const url = resolveUrl(path);
  try {
    const { pathname } = new URL(url);
    return pathname === "/api/v1/auth/login";
  } catch {
    return path.includes("/api/v1/auth/login");
  }
}

/**
 * Cliente HTTP da aplicação: base URL, JSON por defeito, `Authorization: Bearer` quando há token.
 * Em 401 (exceto login), limpa credenciais e dispara {@link registerUnauthorizedHandler}.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (init.body != null && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = resolveUrl(path);
  const res = await fetch(url, { ...init, headers });

  if (res.status === 401 && !isPublicAuthPath(path)) {
    clearStoredAuth();
    unauthorizedHandler?.();
  }

  return res;
}
