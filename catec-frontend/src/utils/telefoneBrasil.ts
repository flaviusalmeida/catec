import { onlyDigits } from "./digitsOnly";

/**
 * Máscara progressiva: fixo (10) `(DD) NNNN-NNNN` | celular (11) `(DD) NNNNN-NNNN`.
 */
export function formatTelefoneBrasil(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/** Telefone brasileiro: DDD (2) + 8 (fixo) ou 9 (celular) dígitos; DDD não começa com 0. */
export function isTelefoneBrasilValid(digits: string): boolean {
  if (!/^\d{10,11}$/.test(digits)) return false;
  if (digits[0] === "0") return false;
  if (/^(\d)\1{9,10}$/.test(digits)) return false;
  return true;
}
