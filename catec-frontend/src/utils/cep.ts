import { onlyDigits } from "./digitsOnly";

/** CEP brasileiro: 8 dígitos com máscara 00000-000. */
export function formatCep(digits: string): string {
  const d = onlyDigits(digits).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}
