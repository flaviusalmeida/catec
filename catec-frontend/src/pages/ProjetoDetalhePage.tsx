import { useCallback, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ContratoPanel from "../components/contrato/ContratoPanel";
import ProjetoDetalheHeaderActions from "../components/projeto/detalhe/ProjetoDetalheHeaderActions";
import PropostaPanel, { type PropostaPanelHandle } from "../components/proposta/PropostaPanel";
import ProjetoStatusBadge from "../components/projeto/ProjetoStatusBadge";
import ProjetoResumoSidebar from "../components/projeto/detalhe/ProjetoResumoSidebar";
import ProjetoTabGeral, { ProjetoTabGeralEscopo } from "../components/projeto/detalhe/ProjetoTabGeral";
import ProjetoTabHistorico from "../components/projeto/detalhe/ProjetoTabHistorico";
import ProjetoTabInteracoes from "../components/projeto/detalhe/ProjetoTabInteracoes";
import RegistrarInteracaoCliente, {
  type RegistrarInteracaoHandle,
} from "../components/projeto/detalhe/RegistrarInteracaoCliente";
import { useProjetoFluxoData } from "../hooks/useProjetoFluxoData";
import InlineAlert from "../components/ui/InlineAlert";
import "./ClientesPage.css";
import "../components/projeto/detalhe/ProjetoDetalhe.css";

const LIST_PATH = "/app/projetos";

type TabId = "geral" | "propostas" | "contrato" | "interacoes" | "historico";

const TABS: { id: TabId; label: string }[] = [
  { id: "geral", label: "Geral" },
  { id: "propostas", label: "Propostas" },
  { id: "contrato", label: "Contrato" },
  { id: "interacoes", label: "Interações" },
  { id: "historico", label: "Histórico" },
];

export default function ProjetoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const projetoId = Number(id);
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const [tab, setTab] = useState<TabId>("geral");
  const [refreshKey, setRefreshKey] = useState(0);
  const propostaRef = useRef<PropostaPanelHandle>(null);
  const interacaoRef = useRef<RegistrarInteracaoHandle>(null);

  const fluxo = useProjetoFluxoData(projetoId, refreshKey, logout);

  const atualizarFluxo = useCallback(() => {
    void fluxo.recarregar();
    setRefreshKey((k) => k + 1);
  }, [fluxo.recarregar]);

  const tituloProjeto = fluxo.carregando ? "…" : (fluxo.projeto?.titulo ?? "Projeto");
  const mostrarContrato =
    fluxo.projeto?.status === "AGUARDANDO_CONTRATO" || fluxo.projeto?.status === "EM_EXECUCAO";

  function editarProjeto() {
    if (!fluxo.projeto) return;
    navigate(LIST_PATH, { state: { editarProjetoId: fluxo.projeto.id } });
  }

  function novaProposta() {
    setTab("propostas");
    propostaRef.current?.criarProposta();
  }

  function registrarInteracao() {
    setTab("interacoes");
    interacaoRef.current?.open();
  }

  return (
    <div className="proj-detalhe-page">
      <div className="proj-detalhe-page__inner">
        <Link className="proj-detalhe-back" to={LIST_PATH}>
          ← Voltar para lista
        </Link>

        {fluxo.erro ? (
          <InlineAlert variant="error">{fluxo.erro}</InlineAlert>
        ) : null}

        {fluxo.carregando ? (
          <p className="proj-detalhe-loading" role="status">
            Carregando dados…
          </p>
        ) : null}

        {!fluxo.carregando && fluxo.projeto ? (
          <>
            <header className="proj-detalhe-header">
              <div className="proj-detalhe-header__left">
                <h1 id="projeto-detalhe-titulo" className="proj-detalhe-header__title">
                  {tituloProjeto}
                </h1>
                <p className="proj-detalhe-header__subtitle">
                  <span className="proj-detalhe-header__cliente">{fluxo.projeto.clienteNome ?? "—"}</span>
                  <span className="proj-detalhe-header__sep" aria-hidden>
                    •
                  </span>
                  <ProjetoStatusBadge status={fluxo.projeto.status} />
                </p>
              </div>
              <ProjetoDetalheHeaderActions
                isAdmin={isAdmin}
                podeNovaProposta={fluxo.podeCriarNovaProposta}
                podeRegistrar={fluxo.podeRegistrarInteracao}
                onEditar={editarProjeto}
                onNovaProposta={novaProposta}
                onRegistrar={registrarInteracao}
              />
            </header>

            <div className="proj-detalhe-layout">
              <div className="proj-detalhe-main">
                <div className="proj-detalhe-tabs-shell">
                  <nav className="proj-detalhe-tabs" aria-label="Seções do projeto">
                    {TABS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={
                          tab === t.id
                            ? "proj-detalhe-tabs__btn proj-detalhe-tabs__btn--active"
                            : "proj-detalhe-tabs__btn"
                        }
                        aria-selected={tab === t.id}
                        onClick={() => setTab(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </nav>

                  <div className="proj-detalhe-tab-panel">
                  {tab === "geral" ? (
                    <>
                      <ProjetoTabGeral projeto={fluxo.projeto} />
                      <ProjetoTabGeralEscopo projeto={fluxo.projeto} />
                    </>
                  ) : null}

                  {tab === "propostas" ? (
                    <PropostaPanel
                      ref={propostaRef}
                      embedded
                      hideHeaderActions
                      projetoId={fluxo.projeto.id}
                      projetoTemCliente={fluxo.projeto.clienteId != null}
                      onPropostaAtualizada={atualizarFluxo}
                    />
                  ) : null}

                  {tab === "contrato" ? (
                    mostrarContrato ? (
                      <ContratoPanel
                        embedded
                        projetoId={fluxo.projeto.id}
                        onContratoAtualizado={atualizarFluxo}
                      />
                    ) : (
                      <p className="proj-detalhe-hint">
                        O contrato ficará disponível quando o projeto estiver aguardando contrato ou em execução.
                      </p>
                    )
                  ) : null}

                  {tab === "interacoes" ? (
                    <>
                      <ProjetoTabInteracoes interacoes={fluxo.interacoes} />
                    </>
                  ) : null}

                  {tab === "historico" ? (
                    <ProjetoTabHistorico projetoId={fluxo.projeto.id} refreshKey={refreshKey} />
                  ) : null}
                  </div>
                </div>
              </div>

              <aside className="proj-detalhe-sidebar">
                <ProjetoResumoSidebar
                  projeto={fluxo.projeto}
                  propostaAtual={fluxo.propostaAtual}
                  contrato={fluxo.contrato}
                  ultimaInteracao={fluxo.ultimaInteracao}
                />
              </aside>
            </div>

            <RegistrarInteracaoCliente
              ref={interacaoRef}
              projetoId={fluxo.projeto.id}
              propostas={fluxo.propostas}
              contrato={fluxo.contrato}
              refreshKey={refreshKey}
              onAtualizado={atualizarFluxo}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
