/** Formata ISO instant para exibição em pt-BR (data + hora). */
export function formatInstantBr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Converte `input[type=date]` (yyyy-MM-dd) para fim do dia local em ISO (filtro `prazoAte`). */
export function dateInputToPrazoAteIso(dateStr: string): string | undefined {
  const trimmed = dateStr.trim();
  if (!trimmed) return undefined;
  const parts = trimmed.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return undefined;
  const [y, m, d] = parts;
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return end.toISOString();
}
