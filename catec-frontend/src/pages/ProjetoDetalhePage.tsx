import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import TextLinkButton from "../components/buttons/TextLinkButton";
import GhostButton from "../components/buttons/GhostButton";
import FieldControl from "../components/form/FieldControl";
import FormField from "../components/form/FormField";
import AdminEntityFormPage from "../components/layout/AdminEntityFormPage";
import AdminEntityFormActions from "../components/layout/AdminEntityFormActions";
import ModalFormGrid from "../components/layout/ModalFormGrid";
import {
  AdminEntityFormAlerts,
  AdminEntityFormHeadline,
  AdminFormDivider,
  AdminFormFields,
  AdminFormSection,
} from "../components/layout/entityFormKit";
import PropostaPanel from "../components/proposta/PropostaPanel";
import InlineAlert from "../components/ui/InlineAlert";
import { mensagemErroApi } from "../utils/apiError";
import { STATUS_PROJETO_ROTULO, type Projeto } from "./projetoTypes";
import "./ClientesPage.css";

const LIST_PATH = "/app/projetos";

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

  const tituloProjeto = carregando ? "…" : (projeto?.titulo ?? "Projeto");

  return (
    <AdminEntityFormPage
      listPath={LIST_PATH}
      titleId="projeto-detalhe-titulo"
      title={<AdminEntityFormHeadline action="Projeto" entityLabel={tituloProjeto} />}
      subtitle="Detalhe da demanda e fluxo de proposta comercial."
      footer={
        <AdminEntityFormActions>
          <GhostButton onClick={() => navigate(LIST_PATH)} disabled={carregando}>
            Voltar à lista
          </GhostButton>
        </AdminEntityFormActions>
      }
    >
      <AdminEntityFormAlerts>
        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}
        {carregando ? (
          <p className="admin-entity-form-loading" role="status">
            Carregando dados…
          </p>
        ) : null}
      </AdminEntityFormAlerts>

      {!carregando && projeto ? (
        <>
          <AdminFormSection title="Demanda" titleId="proj-sec-demanda">
            <AdminFormFields>
              <ModalFormGrid balanced>
                <FormField label="Cliente" htmlFor="pd-cliente">
                  <FieldControl
                    id="pd-cliente"
                    className="clientes-input"
                    variant="modal"
                    readOnly
                    value={projeto.clienteNome ?? "—"}
                  />
                </FormField>
                <FormField label="Criado por" htmlFor="pd-criado-por">
                  <FieldControl
                    id="pd-criado-por"
                    className="clientes-input"
                    variant="modal"
                    readOnly
                    value={projeto.criadoPorNome}
                  />
                </FormField>
              </ModalFormGrid>
              <AdminFormDivider />
              <ModalFormGrid balanced>
                <FormField label="Status" htmlFor="pd-status">
                  <FieldControl
                    id="pd-status"
                    className="clientes-input"
                    variant="modal"
                    readOnly
                    value={STATUS_PROJETO_ROTULO[projeto.status]}
                  />
                </FormField>
                <FormField label="E-mail de contato" htmlFor="pd-email">
                  <FieldControl
                    id="pd-email"
                    className="clientes-input"
                    variant="modal"
                    readOnly
                    value={projeto.emailContato ?? "—"}
                  />
                </FormField>
              </ModalFormGrid>
              <ModalFormGrid balanced>
                <FormField label="Telefone de contato" htmlFor="pd-telefone">
                  <FieldControl
                    id="pd-telefone"
                    className="clientes-input"
                    variant="modal"
                    readOnly
                    value={projeto.telefoneContato ?? "—"}
                  />
                </FormField>
              </ModalFormGrid>
              <AdminFormDivider />
              <FormField label="Escopo da demanda" htmlFor="pd-escopo">
                <FieldControl
                  as="textarea"
                  id="pd-escopo"
                  className="clientes-input clientes-textarea"
                  variant="modal"
                  readOnly
                  rows={4}
                  value={projeto.escopo.trim() || "—"}
                />
              </FormField>
              {isAdmin && projeto.clienteId != null ? (
                <TextLinkButton onClick={() => navigate(`/app/clientes/${projeto.clienteId}/editar`)}>
                  Editar cadastro do cliente
                </TextLinkButton>
              ) : null}
            </AdminFormFields>
          </AdminFormSection>

          <PropostaPanel
            projetoId={projeto.id}
            projetoTemCliente={projeto.clienteId != null}
            onPropostaAtualizada={() => void carregar()}
          />
        </>
      ) : null}
    </AdminEntityFormPage>
  );
}
