import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import PropostaPanel from "../components/proposta/PropostaPanel";
import ProjetoStatusBadge from "../components/projeto/ProjetoStatusBadge";
import GhostButton from "../components/buttons/GhostButton";
import PageToolbar from "../components/layout/PageToolbar";
import InlineAlert from "../components/ui/InlineAlert";
import { mensagemErroApi } from "../utils/apiError";
import type { Projeto } from "./projetoTypes";
import "./ClientesPage.css";
import "./ProjetoDetalhePage.css";

export default function ProjetoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const projetoId = Number(id);
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!Number.isFinite(projetoId) || projetoId < 1) {
      setErro("Projeto inválido.");
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/projetos/${projetoId}`);
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        setErro("Você não tem permissão para ver este projeto.");
        setProjeto(null);
        return;
      }
      if (!res.ok) {
        setErro(await mensagemErroApi(res, "Erro ao carregar projeto"));
        setProjeto(null);
        return;
      }
      setProjeto((await res.json()) as Projeto);
    } catch {
      setErro("Falha de rede ao carregar projeto.");
    } finally {
      setCarregando(false);
    }
  }, [projetoId, logout, navigate]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <div className="clientes-page">
      <div className="clientes-page-inner clientes-page-stack">
        <PageToolbar
          title={carregando ? "Projeto" : (projeto?.titulo ?? "Projeto")}
          subtitle="Detalhe da demanda e fluxo de proposta comercial."
          actions={
            <GhostButton onClick={() => navigate("/app/projetos")}>
              Voltar à lista
            </GhostButton>
          }
        />

        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

        {carregando ? (
          <p className="projeto-detalhe__hint" role="status">
            Carregando…
          </p>
        ) : projeto ? (
          <>
            <section className="projeto-detalhe__resumo" aria-labelledby="proj-resumo-heading">
              <h2 id="proj-resumo-heading" className="visually-hidden">
                Resumo
              </h2>
              <p>
                <strong>Cliente:</strong> {projeto.clienteNome ?? "—"}
              </p>
              <p>
                <strong>Criado por:</strong> {projeto.criadoPorNome}
              </p>
              <p className="projeto-detalhe__status-linha">
                <strong>Status:</strong> <ProjetoStatusBadge status={projeto.status} />
              </p>
              <p className="projeto-detalhe__escopo">{projeto.escopo}</p>
              {isAdmin && projeto.clienteId != null ? (
                <p>
                  <Link to={`/app/clientes/${projeto.clienteId}/editar`}>Editar cadastro do cliente</Link>
                </p>
              ) : null}
            </section>

            <PropostaPanel
              projetoId={projeto.id}
              projetoTemCliente={projeto.clienteId != null}
              onPropostaAtualizada={() => void carregar()}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
