import { apiFetch } from "./http";

export async function fetchProjetoHistorico(
  projetoId: number,
  page: number,
  size: number,
): Promise<Response> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return apiFetch(`/api/v1/projetos/${projetoId}/historico?${params}`);
}
