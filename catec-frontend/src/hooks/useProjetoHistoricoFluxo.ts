import { useCallback, useEffect, useState } from "react";
import { fetchPainelHistorico } from "../api/painelApi";
import type { PageResponse } from "../types/apiPage";
import type { PainelHistoricoItem } from "../pages/painelTypes";
import { mensagemErroApi } from "../utils/apiError";

const PAGE_SIZE = 20;

export function useProjetoHistoricoFluxo(projetoId: number, refreshKey: number, logout: () => void) {
  const [page, setPage] = useState(0);
  const [dados, setDados] = useState<PageResponse<PainelHistoricoItem> | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(
    async (pagina: number) => {
      if (!Number.isFinite(projetoId) || projetoId < 1) return;
      setCarregando(true);
      setErro(null);
      try {
        const res = await fetchPainelHistorico(projetoId, pagina, PAGE_SIZE);
        if (res.status === 401) {
          logout();
          return;
        }
        if (!res.ok) {
          setErro(await mensagemErroApi(res, "Erro ao carregar histórico"));
          setDados(null);
          return;
        }
        setDados((await res.json()) as PageResponse<PainelHistoricoItem>);
        setPage(pagina);
      } catch {
        setErro("Falha de rede ao carregar histórico.");
        setDados(null);
      } finally {
        setCarregando(false);
      }
    },
    [projetoId, logout],
  );

  useEffect(() => {
    setPage(0);
    void carregar(0);
  }, [carregar, refreshKey]);

  return {
    itens: dados?.content ?? [],
    carregando,
    erro,
    page,
    pageSize: PAGE_SIZE,
    totalElements: dados?.totalElements ?? 0,
    totalPages: dados?.totalPages ?? 0,
    setPage: (p: number) => void carregar(p),
    recarregar: () => void carregar(page),
  };
}
