import type { PageResponse } from "../types/apiPage";
import type {
  PainelFiltrosState,
  PainelHistoricoItem,
  PainelIndicadores,
  PainelProjetoResumo,
} from "../pages/painelTypes";
import { dateInputToPrazoAteIso } from "../utils/dateTimeBr";
import { apiFetch } from "./http";

export type PainelResumoQuery = {
  page: number;
  size: number;
  filtros: PainelFiltrosState;
};

function buildResumoSearchParams({ page, size, filtros }: PainelResumoQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (filtros.clienteId) {
    params.set("clienteId", filtros.clienteId);
  }
  if (filtros.faseMacro) {
    params.set("status", filtros.faseMacro);
  }
  const prazo = dateInputToPrazoAteIso(filtros.prazoAte);
  if (prazo) {
    params.set("prazoAte", prazo);
  }
  return params.toString();
}

export async function fetchPainelIndicadores(): Promise<Response> {
  return apiFetch("/api/v1/painel/indicadores");
}

export async function fetchPainelResumo(query: PainelResumoQuery): Promise<Response> {
  const qs = buildResumoSearchParams(query);
  return apiFetch(`/api/v1/painel/resumo?${qs}`);
}

export async function fetchPainelHistorico(
  projetoId: number,
  page: number,
  size: number,
): Promise<Response> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return apiFetch(`/api/v1/painel/projetos/${projetoId}/historico?${params}`);
}

export type PainelIndicadoresParsed = PainelIndicadores;
export type PainelResumoParsed = PageResponse<PainelProjetoResumo>;
export type PainelHistoricoParsed = PageResponse<PainelHistoricoItem>;
