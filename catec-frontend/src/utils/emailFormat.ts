/**
 * E-mail em formato usual (local@domínio.tld), alinhado ao padrão do backend.
 * Não aceita espaços nem domínios sem TLD com pelo menos 2 letras.
 */
export const EMAIL_FORMAT_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function isEmailValid(email: string): boolean {
  const t = email.trim();
  if (t.length > 255) return false;
  return EMAIL_FORMAT_REGEX.test(t);
}
