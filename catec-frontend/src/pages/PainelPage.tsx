import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPainelIndicadores, fetchPainelResumo } from "../api/painelApi";
import { useAuth } from "../auth/AuthContext";
import PainelFiltros from "../components/painel/PainelFiltros";
import PainelFluxoResumo from "../components/painel/PainelFluxoResumo";
import PainelIndicadoresGrid from "../components/painel/PainelIndicadoresGrid";
import PainelResumoTable from "../components/painel/PainelResumoTable";
import { ListPage, PageHeader } from "../components/list-page";
import InlineAlert from "../components/ui/InlineAlert";
import type { PageResponse } from "../types/apiPage";
import { mensagemErroApi } from "../utils/apiError";
import type { FaseMacro, PainelFiltrosState, PainelIndicadores, PainelProjetoResumo } from "./painelTypes";
import { PAINEL_FILTROS_VAZIOS } from "./painelTypes";
import "./PainelPage.css";

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

  const [erro, setErro] = useState<string | null>(null);

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
      } catch {
        setErro("Falha de rede ao carregar resumo.");
        setResumo(null);
      } finally {
        setCarregandoResumo(false);
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

  return (
    <ListPage className="painel-page">
      <PageHeader
        title="Painel de visibilidade"
        subtitle="Acompanhamento gerencial do fluxo comercial."
      />

      {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

      <div className="painel-page__kpis">
        <PainelIndicadoresGrid
          indicadores={indicadores}
          carregando={carregandoIndicadores}
          faseMacroAtiva={filtrosAplicados.faseMacro}
          onFiltrarFase={filtrarPorFase}
        />
        <PainelFluxoResumo indicadores={indicadores} carregando={carregandoIndicadores} />
      </div>

      <PainelFiltros
        filtros={filtrosRascunho}
        onChange={setFiltrosRascunho}
        onClear={limparFiltros}
        onAplicar={aplicarFiltros}
        clienteFetchError={clienteFetchError}
        onClienteFetchError={setClienteFetchError}
      />

      <PainelResumoTable
        itens={resumo?.content ?? []}
        carregando={carregandoResumo}
        page={resumoPage}
        pageSize={PAGE_SIZE}
        totalElements={resumo?.totalElements ?? 0}
        totalPages={resumo?.totalPages ?? 0}
        onPageChange={setResumoPage}
      />
    </ListPage>
  );
}
