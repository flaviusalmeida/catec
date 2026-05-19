import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPainelHistorico, fetchPainelIndicadores, fetchPainelResumo } from "../api/painelApi";
import { useAuth } from "../auth/AuthContext";
import PainelFiltros from "../components/painel/PainelFiltros";
import PainelHistoricoLista from "../components/painel/PainelHistoricoLista";
import PainelIndicadoresGrid from "../components/painel/PainelIndicadoresGrid";
import PainelResumoTable from "../components/painel/PainelResumoTable";
import PageToolbar from "../components/layout/PageToolbar";
import InlineAlert from "../components/ui/InlineAlert";
import type { PageResponse } from "../types/apiPage";
import { mensagemErroApi } from "../utils/apiError";
import type {
  FaseMacro,
  PainelFiltrosState,
  PainelHistoricoItem,
  PainelIndicadores,
  PainelProjetoResumo,
} from "./painelTypes";
import { PAINEL_FILTROS_VAZIOS } from "./painelTypes";
import "./PainelPage.css";
import "../styles/admin-crud-table.css";

const PAGE_SIZE = 20;

export default function PainelPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [filtrosRascunho, setFiltrosRascunho] = useState<PainelFiltrosState>(PAINEL_FILTROS_VAZIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState<PainelFiltrosState>(PAINEL_FILTROS_VAZIOS);
  const [clienteFetchError, setClienteFetchError] = useState<string | null>(null);

  const [indicadores, setIndicadores] = useState<PainelIndicadores | null>(null);
  const [carregandoIndicadores, setCarregandoIndicadores] = useState(true);

  const [resumo, setResumo] = useState<PageResponse<PainelProjetoResumo> | null>(null);
  const [resumoPage, setResumoPage] = useState(0);
  const [carregandoResumo, setCarregandoResumo] = useState(true);

  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<number | null>(null);
  const [historico, setHistorico] = useState<PageResponse<PainelHistoricoItem> | null>(null);
  const [historicoPage, setHistoricoPage] = useState(0);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [erro, setErro] = useState<string | null>(null);

  const projetoSelecionado = useMemo(
    () => resumo?.content.find((p) => p.projetoId === projetoSelecionadoId) ?? null,
    [resumo?.content, projetoSelecionadoId],
  );

  const carregarIndicadores = useCallback(async () => {
    setCarregandoIndicadores(true);
    try {
      const res = await fetchPainelIndicadores();
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) {
        setErro(await mensagemErroApi(res, "Erro ao carregar indicadores"));
        return;
      }
      setIndicadores((await res.json()) as PainelIndicadores);
    } catch {
      setErro("Falha de rede ao carregar indicadores.");
    } finally {
      setCarregandoIndicadores(false);
    }
  }, [logout, navigate]);

  const carregarResumo = useCallback(
    async (page: number, filtros: PainelFiltrosState) => {
      setCarregandoResumo(true);
      setErro(null);
      try {
        const res = await fetchPainelResumo({ page, size: PAGE_SIZE, filtros });
        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) {
          setErro(await mensagemErroApi(res, "Erro ao carregar resumo"));
          setResumo(null);
          return;
        }
        const data = (await res.json()) as PageResponse<PainelProjetoResumo>;
        setResumo(data);
        setResumoPage(page);
        if (
          projetoSelecionadoId != null &&
          !data.content.some((p) => p.projetoId === projetoSelecionadoId)
        ) {
          setProjetoSelecionadoId(null);
          setHistorico(null);
        }
      } catch {
        setErro("Falha de rede ao carregar resumo.");
        setResumo(null);
      } finally {
        setCarregandoResumo(false);
      }
    },
    [logout, navigate, projetoSelecionadoId],
  );

  const carregarHistorico = useCallback(
    async (projetoId: number, page: number) => {
      setCarregandoHistorico(true);
      try {
        const res = await fetchPainelHistorico(projetoId, page, PAGE_SIZE);
        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) {
          setErro(await mensagemErroApi(res, "Erro ao carregar histórico"));
          setHistorico(null);
          return;
        }
        setHistorico((await res.json()) as PageResponse<PainelHistoricoItem>);
        setHistoricoPage(page);
      } catch {
        setErro("Falha de rede ao carregar histórico.");
        setHistorico(null);
      } finally {
        setCarregandoHistorico(false);
      }
    },
    [logout, navigate],
  );

  useEffect(() => {
    void carregarIndicadores();
  }, [carregarIndicadores]);

  useEffect(() => {
    void carregarResumo(resumoPage, filtrosAplicados);
  }, [carregarResumo, resumoPage, filtrosAplicados]);

  useEffect(() => {
    if (projetoSelecionadoId == null) {
      setHistorico(null);
      return;
    }
    void carregarHistorico(projetoSelecionadoId, historicoPage);
  }, [carregarHistorico, historicoPage, projetoSelecionadoId]);

  function aplicarFiltros() {
    setFiltrosAplicados({ ...filtrosRascunho });
    setResumoPage(0);
  }

  function limparFiltros() {
    setFiltrosRascunho(PAINEL_FILTROS_VAZIOS);
    setFiltrosAplicados(PAINEL_FILTROS_VAZIOS);
    setResumoPage(0);
    setClienteFetchError(null);
  }

  function filtrarPorFase(fase: FaseMacro) {
    const next: PainelFiltrosState = {
      ...filtrosRascunho,
      faseMacro: filtrosAplicados.faseMacro === fase ? "" : fase,
    };
    setFiltrosRascunho(next);
    setFiltrosAplicados(next);
    setResumoPage(0);
  }

  function selecionarProjeto(projetoId: number) {
    setProjetoSelecionadoId(projetoId);
    setHistoricoPage(0);
  }

  return (
    <div className="painel-page clientes-page">
      <div className="clientes-page-inner painel-page__inner">
        <PageToolbar
          title="Painel de visibilidade"
          subtitle="Visão geral, filtros, indicadores e histórico do fluxo comercial (Fase 1)."
        />

        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

        <PainelIndicadoresGrid
          indicadores={indicadores}
          carregando={carregandoIndicadores}
          faseMacroAtiva={filtrosAplicados.faseMacro}
          onFiltrarFase={filtrarPorFase}
        />

        <PainelFiltros
          filtros={filtrosRascunho}
          onChange={setFiltrosRascunho}
          onClear={limparFiltros}
          onAplicar={aplicarFiltros}
          clienteFetchError={clienteFetchError}
          onClienteFetchError={setClienteFetchError}
        />

        <div className="painel-page__workspace">
          <PainelResumoTable
            itens={resumo?.content ?? []}
            carregando={carregandoResumo}
            page={resumoPage}
            pageSize={PAGE_SIZE}
            totalElements={resumo?.totalElements ?? 0}
            totalPages={resumo?.totalPages ?? 0}
            projetoSelecionadoId={projetoSelecionadoId}
            onPageChange={setResumoPage}
            onSelecionarProjeto={selecionarProjeto}
          />
          <PainelHistoricoLista
            projeto={projetoSelecionado}
            itens={historico?.content ?? []}
            carregando={carregandoHistorico}
            page={historicoPage}
            pageSize={PAGE_SIZE}
            totalElements={historico?.totalElements ?? 0}
            totalPages={historico?.totalPages ?? 0}
            onPageChange={setHistoricoPage}
          />
        </div>
      </div>
    </div>
  );
}
