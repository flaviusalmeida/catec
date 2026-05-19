const TOKEN_KEY = "catec_token";
const TOKEN_TYPE_KEY = "catec_token_type";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(accessToken: string, tokenType = "Bearer"): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
}
