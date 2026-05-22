import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import PrimaryButton from "../buttons/PrimaryButton";
import FieldControl from "../form/FieldControl";
import FormField from "../form/FormField";
import {
  AdminFormDivider,
  AdminFormFields,
  AdminFormSection,
} from "../layout/entityFormKit";
import FileRow from "../projeto/detalhe/FileRow";
import {
  formatarDataCurta,
  InfoGrid,
  InfoItem,
  SectionLabel,
} from "../projeto/detalhe/detalheUi";
import TabSectionHeader from "../projeto/detalhe/TabSectionHeader";
import {
  STATE_EMPTY_PROPOSTA,
  STATE_PROPOSTA_SEM_CLIENTE,
} from "../projeto/detalhe/stateMessages";
import StateCard from "../ui/StateCard";
import UploadCard from "../ui/UploadCard";
import WorkflowActionBar, { type WorkflowAction } from "../ui/WorkflowActionBar";
import {
  propostaWorkflowPermissions,
  resolvePropostaWorkflowUi,
  type PropostaWorkflowActionKey,
} from "./propostaWorkflowUi";
import InlineAlert from "../ui/InlineAlert";
import { mensagemErroApi } from "../../utils/apiError";
import { downloadDocumento } from "../../utils/downloadDocumento";
import { documentoMaisRecente, documentosParaExibicao } from "../../utils/documentoUtils";
import type {
  DocumentoAnexo,
  Proposta,
  PropostaStatus,
} from "../../pages/propostaTypes";
import {
  STATUS_PROPOSTA_ENVIADA,
  STATUS_PROPOSTA_ROTULO,
  STATUS_PROPOSTA_UPLOAD,
} from "../../pages/propostaTypes";
import "../../pages/ClientesPage.css";
import "./PropostaPanel.css";

export type PropostaPanelHandle = {
  criarProposta: () => void;
  podeCriarNova: boolean;
};

type Props = {
  projetoId: number;
  projetoTemCliente: boolean;
  onPropostaAtualizada?: () => void;
  embedded?: boolean;
};

type DocumentoHistorico = DocumentoAnexo & {
  propostaId: number;
  propostaVersao: number;
  propostaStatus: PropostaStatus;
};

function PanelDivider({ embedded }: { embedded?: boolean }) {
  return embedded ? null : <AdminFormDivider />;
}

function PanelBloco({ embedded, children }: { embedded?: boolean; children: ReactNode }) {
  return embedded ? <div className="proj-detalhe-block">{children}</div> : <>{children}</>;
}

function PanelSubtitulo({ embedded, children }: { embedded?: boolean; children: ReactNode }) {
  return embedded ? <SectionLabel>{children}</SectionLabel> : <p className="proposta-panel__subtitulo">{children}</p>;
}

const STATUS_PROPOSTA_ATIVA: PropostaStatus[] = [
  "RASCUNHO",
  "PENDENTE_AVALIACAO_SOCIO",
  "APROVADA_INTERNA",
];

function formatarDataHora(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR");
}

function tituloHistoricoProposta(proposta: Proposta): string {
  if (proposta.enviadaClienteEm) {
    return `v${proposta.versao} — enviada em ${formatarDataHora(proposta.enviadaClienteEm)}`;
  }
  return `v${proposta.versao} — ${STATUS_PROPOSTA_ROTULO[proposta.status]}`;
}

/** Versão mais recente do projeto (lista vem ordenada por versão desc). */
function idPropostaAtual(lista: Proposta[], preferirId?: number | null): number | null {
  if (lista.length === 0) return null;
  if (preferirId != null && lista.some((p) => p.id === preferirId)) return preferirId;
  return lista[0].id;
}

const PropostaPanel = forwardRef<PropostaPanelHandle, Props>(function PropostaPanel(
  { projetoId, projetoTemCliente, onPropostaAtualizada, embedded = false },
  ref,
) {
  const { isAdmin, isSocio, logout } = useAuth();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
  const [documentosVersao, setDocumentosVersao] = useState<DocumentoAnexo[]>([]);
  const [documentosEnviados, setDocumentosEnviados] = useState<DocumentoHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoErro, setAcaoErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const uploadEmAndamentoRef = useRef(false);
  const selecionada = propostas.find((p) => p.id === selecionadaId) ?? null;
  const temAnexo = documentosVersao.length > 0;
  const temPropostaAtiva = propostas.some((p) => STATUS_PROPOSTA_ATIVA.includes(p.status));
  const aguardandoAjusteCliente = propostas.some(
    (p) => p.status === "AGUARDANDO_AJUSTE_ADM" || p.consideracoesPendentes,
  );
  const podeCriarNova =
    isAdmin &&
    projetoTemCliente &&
    !temPropostaAtiva &&
    !processando &&
    (propostas.length === 0 || aguardandoAjusteCliente);

  const carregarHistorico = useCallback(
    async (lista: Proposta[], propostaSelecionadaId: number | null) => {
      if (lista.length === 0) {
        setDocumentosVersao([]);
        setDocumentosEnviados([]);
        return;
      }

      try {
        const detalhes = await Promise.all(
          lista.map(async (p) => {
            const resDoc = await apiFetch(`/api/v1/projetos/${projetoId}/propostas/${p.id}/documentos`);
            const docs = resDoc.ok ? ((await resDoc.json()) as DocumentoAnexo[]) : [];
            return { proposta: p, docs };
          }),
        );

        const selecionadaDetalhe = detalhes.find((d) => d.proposta.id === propostaSelecionadaId);
        const statusSelecionada = selecionadaDetalhe?.proposta.status;
        setDocumentosVersao(
          documentosParaExibicao(
            selecionadaDetalhe?.docs ?? [],
            statusSelecionada === "RASCUNHO",
          ),
        );

        const enviados: DocumentoHistorico[] = detalhes
          .filter((d) => STATUS_PROPOSTA_ENVIADA.includes(d.proposta.status) && d.docs.length > 0)
          .flatMap((d) =>
            d.docs.map((doc) => ({
              ...doc,
              propostaId: d.proposta.id,
              propostaVersao: d.proposta.versao,
              propostaStatus: d.proposta.status,
            })),
          )
          .sort((a, b) => b.propostaVersao - a.propostaVersao);

        setDocumentosEnviados(enviados);
      } catch {
        setDocumentosVersao([]);
        setDocumentosEnviados([]);
      }
    },
    [projetoId],
  );

  const carregarPropostas = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/projetos/${projetoId}/propostas`);
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setErro(await mensagemErroApi(res, "Erro ao carregar propostas"));
        setPropostas([]);
        return;
      }
      const lista = (await res.json()) as Proposta[];
      setPropostas(lista);
      setAcaoErro(null);
      setSelecionadaId(idPropostaAtual(lista));
    } catch {
      setErro("Falha de rede ao carregar propostas.");
    } finally {
      setCarregando(false);
    }
  }, [projetoId, logout]);

  useEffect(() => {
    void carregarPropostas();
  }, [carregarPropostas]);

  useEffect(() => {
    if (propostas.length > 0 && selecionadaId != null) {
      void carregarHistorico(propostas, selecionadaId);
    }
  }, [selecionadaId, propostas, carregarHistorico]);

  async function recarregarTudo(manterSelecaoId?: number) {
    const res = await apiFetch(`/api/v1/projetos/${projetoId}/propostas`);
    if (!res.ok) return;
    const lista = (await res.json()) as Proposta[];
    setPropostas(lista);
    const id = idPropostaAtual(lista, manterSelecaoId);
    setSelecionadaId(id);
    await carregarHistorico(lista, id);
  }

  async function executarAcao(path: string, metodo: "POST" = "POST", body?: unknown): Promise<boolean> {
    if (selecionadaId == null) return false;
    setProcessando(true);
    setAcaoErro(null);
    try {
      const res = await apiFetch(`/api/v1/projetos/${projetoId}/propostas/${selecionadaId}${path}`, {
        method: metodo,
        body: body != null ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Ação não concluída"));
        return false;
      }
      await recarregarTudo(selecionadaId);
      onPropostaAtualizada?.();
      return true;
    } catch {
      setAcaoErro("Falha de rede.");
      return false;
    } finally {
      setProcessando(false);
    }
  }

  async function criarProposta() {
    if (!podeCriarNova) return;
    setProcessando(true);
    setAcaoErro(null);
    try {
      const res = await apiFetch(`/api/v1/projetos/${projetoId}/propostas`, {
        method: "POST",
        body: JSON.stringify({ requerAvaliacaoSocio: false }),
      });
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Erro ao criar proposta"));
        return;
      }
      const nova = (await res.json()) as Proposta;
      await recarregarTudo(nova.id);
      onPropostaAtualizada?.();
    } catch {
      setAcaoErro("Falha de rede ao criar proposta.");
    } finally {
      setProcessando(false);
    }
  }

  async function definirRequerSocio(requer: boolean): Promise<boolean> {
    if (selecionadaId == null || selecionada?.status !== "RASCUNHO") return false;
    if (selecionada.requerAvaliacaoSocio === requer) return true;
    try {
      const res = await apiFetch(
        `/api/v1/projetos/${projetoId}/propostas/${selecionadaId}/configuracao-rascunho`,
        {
          method: "PATCH",
          body: JSON.stringify({ requerAvaliacaoSocio: requer }),
        },
      );
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Erro ao atualizar configuração"));
        return false;
      }
      await recarregarTudo(selecionadaId);
      return true;
    } catch {
      setAcaoErro("Falha de rede ao atualizar configuração.");
      return false;
    }
  }

  async function enviarParaAvaliacao() {
    if (selecionadaId == null || !rascunhoComAnexo) return;
    setProcessando(true);
    setAcaoErro(null);
    try {
      if (!(await definirRequerSocio(true))) return;
      const res = await apiFetch(
        `/api/v1/projetos/${projetoId}/propostas/${selecionadaId}/submeter-avaliacao-socio`,
        { method: "POST" },
      );
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Não foi possível enviar para avaliação"));
        return;
      }
      await recarregarTudo(selecionadaId);
      onPropostaAtualizada?.();
    } catch {
      setAcaoErro("Falha de rede ao enviar para avaliação.");
    } finally {
      setProcessando(false);
    }
  }

  async function aprovarProposta() {
    if (selecionadaId == null || !rascunhoComAnexo) return;
    setProcessando(true);
    setAcaoErro(null);
    try {
      if (selecionada?.requerAvaliacaoSocio && !(await definirRequerSocio(false))) return;
      const res = await apiFetch(
        `/api/v1/projetos/${projetoId}/propostas/${selecionadaId}/aprovar-interna`,
        { method: "POST" },
      );
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Não foi possível aprovar a proposta"));
        return;
      }
      await recarregarTudo(selecionadaId);
      onPropostaAtualizada?.();
    } catch {
      setAcaoErro("Falha de rede ao aprovar.");
    } finally {
      setProcessando(false);
    }
  }

  async function enviarDocumento(arquivo: File) {
    if (!selecionadaId || uploadEmAndamentoRef.current) return;
    uploadEmAndamentoRef.current = true;
    setProcessando(true);
    setAcaoErro(null);
    const fd = new FormData();
    fd.append("file", arquivo);
    fd.append("tipoArquivo", "PROPOSTA_COMERCIAL");
    try {
      const res = await apiFetch(
        `/api/v1/projetos/${projetoId}/propostas/${selecionadaId}/documentos`,
        { method: "POST", body: fd },
      );
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Erro no upload"));
        return;
      }
      await recarregarTudo(selecionadaId);
    } catch {
      setAcaoErro("Falha de rede no upload.");
    } finally {
      uploadEmAndamentoRef.current = false;
      setProcessando(false);
    }
  }

  const podeUpload = isAdmin && selecionada && STATUS_PROPOSTA_UPLOAD.includes(selecionada.status);
  const uploadRascunho = Boolean(podeUpload && selecionada?.status === "RASCUNHO");
  const documentoAtual = documentoMaisRecente(documentosVersao);
  const mostrarProposta = !carregando && propostas.length > 0 && selecionada != null;
  const documentosEnviadosHistorico =
    selecionadaId != null
      ? documentosEnviados.filter((d) => d.propostaId !== selecionadaId)
      : documentosEnviados;

  const rascunhoComAnexo = isAdmin && selecionada?.status === "RASCUNHO" && temAnexo;

  const workflowUi =
    selecionada != null
      ? resolvePropostaWorkflowUi(selecionada.status, {
          hasAttachment: temAnexo,
          permissions: { isAdmin, isSocio },
        })
      : { kind: "none" as const };

  const workflowPermissionList = propostaWorkflowPermissions({ isAdmin, isSocio });

  function acaoWorkflow(key: PropostaWorkflowActionKey): () => void {
    switch (key) {
      case "aprovar-rascunho":
        return () => void aprovarProposta();
      case "solicitar-revisao":
        return () => void enviarParaAvaliacao();
      case "aprovar-socio":
        return () => void executarAcao("/aprovar-socio");
      case "reprovar-socio":
        return () => void executarAcao("/devolver-rascunho");
      case "enviar-cliente":
        return () => void executarAcao("/enviar-cliente");
    }
  }

  const workflowActions: WorkflowAction[] =
    workflowUi.kind === "actions"
      ? workflowUi.actions.map((def) => ({
          id: def.key,
          label: def.label,
          variant: def.variant,
          permission: def.permission,
          disabled: processando,
          onClick: acaoWorkflow(def.key),
        }))
      : [];

  const elaboracaoTexto = selecionada ? selecionada.elaboradoPorNome : "";

  function baixarDocumento(doc: DocumentoAnexo) {
    void downloadDocumento(doc.id, doc.nomeOriginal).catch(() => setAcaoErro("Download falhou."));
  }

  useImperativeHandle(ref, () => ({
    criarProposta: () => void criarProposta(),
    podeCriarNova,
  }));

  const conteudo = (
    <>
        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}
        {acaoErro ? <InlineAlert variant="error">{acaoErro}</InlineAlert> : null}

        {carregando ? (
          <p className="admin-entity-form-loading" role="status">
            Carregando propostas…
          </p>
        ) : propostas.length === 0 ? (
          <StateCard
            type="empty"
            title={STATE_EMPTY_PROPOSTA}
            description={!projetoTemCliente ? STATE_PROPOSTA_SEM_CLIENTE : undefined}
          />
        ) : mostrarProposta ? (
          embedded ? (
            <InfoGrid>
              <InfoItem label="Status">{STATUS_PROPOSTA_ROTULO[selecionada!.status]}</InfoItem>
              <InfoItem label="Responsável">{elaboracaoTexto || "—"}</InfoItem>
            </InfoGrid>
          ) : (
            <AdminFormFields>
              <FormField label="Status" htmlFor="prop-status">
                <FieldControl
                  id="prop-status"
                  className="clientes-input"
                  variant="modal"
                  readOnly
                  value={STATUS_PROPOSTA_ROTULO[selecionada!.status]}
                />
              </FormField>

              <FormField label="Elaboração" htmlFor="prop-elaboracao">
                <FieldControl
                  id="prop-elaboracao"
                  className="clientes-input"
                  variant="modal"
                  readOnly
                  value={elaboracaoTexto}
                />
              </FormField>
            </AdminFormFields>
          )
        ) : null}

        {mostrarProposta ? (
          <>
            {uploadRascunho ? (
              <PanelBloco embedded={embedded}>
                <UploadCard
                  title="Enviar proposta"
                  file={
                    documentoAtual
                      ? {
                          nomeArquivo: documentoAtual.nomeOriginal,
                          meta: `Versão ${selecionada!.versao}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ""}`,
                        }
                      : null
                  }
                  documentSectionTitle={
                    documentoAtual ? "Documento da proposta em elaboração" : undefined
                  }
                  uploading={processando}
                  disabled={processando}
                  onUpload={(arquivo) => void enviarDocumento(arquivo)}
                  onDownload={documentoAtual ? () => baixarDocumento(documentoAtual) : undefined}
                  onError={setAcaoErro}
                  inputId="prop-arquivo-upload"
                />
              </PanelBloco>
            ) : null}

            {!uploadRascunho && temAnexo ? (
              <PanelBloco embedded={embedded}>
                <PanelSubtitulo embedded={embedded}>
                  {STATUS_PROPOSTA_ENVIADA.includes(selecionada!.status)
                    ? "Documento da proposta"
                    : "Documento da proposta em elaboração"}
                </PanelSubtitulo>
                <div className="proj-detalhe-file-rows">
                  {documentosVersao.map((d) => (
                    <FileRow
                      key={d.id}
                      nomeArquivo={d.nomeOriginal}
                      meta={`Versão ${selecionada!.versao}${d.criadoEm ? ` • ${formatarDataCurta(d.criadoEm)}` : ""}`}
                      onDownload={() => baixarDocumento(d)}
                    />
                  ))}
                </div>
              </PanelBloco>
            ) : null}

            {documentosEnviadosHistorico.length > 0 ? (
              <PanelBloco embedded={embedded}>
                {!embedded && temAnexo ? <AdminFormDivider /> : null}
                <PanelSubtitulo embedded={embedded}>Versões anteriores</PanelSubtitulo>
                <div className="proj-detalhe-file-rows">
                  {documentosEnviadosHistorico.map((d) => {
                    const propostaRef = propostas.find((p) => p.id === d.propostaId);
                    if (!propostaRef) return null;
                    return (
                      <FileRow
                        key={`${d.propostaId}-${d.id}`}
                        nomeArquivo={d.nomeOriginal}
                        meta={`Versão ${d.propostaVersao} • ${tituloHistoricoProposta(propostaRef)}`}
                        onDownload={() => baixarDocumento(d)}
                      />
                    );
                  })}
                </div>
              </PanelBloco>
            ) : null}

            {workflowUi.kind === "actions" ? (
              <PanelBloco embedded={embedded}>
                <PanelDivider embedded={embedded} />
                <WorkflowActionBar
                  actions={workflowActions}
                  permissions={workflowPermissionList}
                  status={selecionada!.status}
                />
              </PanelBloco>
            ) : null}

            {workflowUi.kind === "state" ? (
              <PanelBloco embedded={embedded}>
                <PanelDivider embedded={embedded} />
                <StateCard
                  type="unavailable"
                  title={workflowUi.state.title}
                  description={workflowUi.state.description}
                />
              </PanelBloco>
            ) : null}
          </>
        ) : null}
    </>
  );

  if (embedded) {
    return (
      <section className="proj-detalhe-tab-section" aria-labelledby="prop-sec-comercial">
        <TabSectionHeader
          titleId="prop-sec-comercial"
          title="Proposta comercial"
          actionAriaLabel="Adicionar proposta comercial"
          onAction={() => void criarProposta()}
          hideAction={!podeCriarNova}
          actionDisabled={processando}
          actionTitle={!podeCriarNova ? "Não é possível adicionar proposta no momento" : undefined}
        />
        <div className="proj-detalhe-tab-section__body">{conteudo}</div>
      </section>
    );
  }

  const acoesComercial = podeCriarNova ? (
    <PrimaryButton variant="toolbar" onClick={() => void criarProposta()} disabled={processando}>
      Nova proposta
    </PrimaryButton>
  ) : undefined;

  return (
    <AdminFormSection title="Proposta comercial" titleId="prop-sec-comercial" actions={acoesComercial}>
      {conteudo}
    </AdminFormSection>
  );
});

export default PropostaPanel;
