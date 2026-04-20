/** Mantém apenas os dígitos 0–9. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}
