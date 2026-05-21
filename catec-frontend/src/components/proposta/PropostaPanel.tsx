import { forwardRef, useCallback, useEffect, useImperativeHandle, useState, type ReactNode } from "react";
import { apiFetch } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import GhostButton from "../buttons/GhostButton";
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
  DashboardCard,
  formatarDataCurta,
  InfoGrid,
  InfoItem,
  SectionLabel,
} from "../projeto/detalhe/detalheUi";
import EmptyState from "../ui/EmptyState";
import InlineAlert from "../ui/InlineAlert";
import { mensagemErroApi } from "../../utils/apiError";
import { downloadDocumento } from "../../utils/downloadDocumento";
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
  hideHeaderActions?: boolean;
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
  { projetoId, projetoTemCliente, onPropostaAtualizada, embedded = false, hideHeaderActions = false },
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
  const [arquivoUpload, setArquivoUpload] = useState<File | null>(null);
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
        setDocumentosVersao(selecionadaDetalhe?.docs ?? []);

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

  async function enviarDocumento() {
    if (!selecionadaId || !arquivoUpload) return;
    setProcessando(true);
    setAcaoErro(null);
    const fd = new FormData();
    fd.append("file", arquivoUpload);
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
      setArquivoUpload(null);
      await recarregarTudo(selecionadaId);
    } catch {
      setAcaoErro("Falha de rede no upload.");
    } finally {
      setProcessando(false);
    }
  }

  const podeUpload = isAdmin && selecionada && STATUS_PROPOSTA_UPLOAD.includes(selecionada.status);
  const mostrarFormularioUpload = podeUpload && selecionada?.status === "RASCUNHO" && !temAnexo;
  const mostrarProposta = !carregando && propostas.length > 0 && selecionada != null;
  const documentosEnviadosHistorico =
    selecionadaId != null
      ? documentosEnviados.filter((d) => d.propostaId !== selecionadaId)
      : documentosEnviados;

  const rascunhoComAnexo = isAdmin && selecionada?.status === "RASCUNHO" && temAnexo;

  const elaboracaoTexto = selecionada ? selecionada.elaboradoPorNome : "";

  const mostrarDocumentoVersaoAtual = selecionada != null;

  function baixarDocumento(doc: DocumentoAnexo) {
    void downloadDocumento(doc.id, doc.nomeOriginal).catch(() => setAcaoErro("Download falhou."));
  }

  useImperativeHandle(ref, () => ({
    criarProposta: () => void criarProposta(),
    podeCriarNova,
  }));

  const acoesComercial =
    !hideHeaderActions && podeCriarNova ? (
      <PrimaryButton variant="toolbar" onClick={() => void criarProposta()} disabled={processando}>
        Nova
      </PrimaryButton>
    ) : undefined;

  const conteudo = (
    <>
        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}
        {acaoErro ? <InlineAlert variant="error">{acaoErro}</InlineAlert> : null}

        {carregando ? (
          <p className="admin-entity-form-loading" role="status">
            Carregando propostas…
          </p>
        ) : propostas.length === 0 ? (
          <div className="proposta-panel__vazio">
            <EmptyState
              variant="inline"
              title="Nenhuma proposta"
              description={
                projetoTemCliente
                  ? "Inicie uma proposta comercial para anexar o documento e seguir com a aprovação."
                  : "Associe um cliente ao projeto antes de criar a proposta comercial."
              }
            />
          </div>
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
            {(mostrarDocumentoVersaoAtual || mostrarFormularioUpload) && (
              <PanelBloco embedded={embedded}>
                {mostrarDocumentoVersaoAtual ? (
                  <>
                    <PanelSubtitulo embedded={embedded}>
                      {STATUS_PROPOSTA_ENVIADA.includes(selecionada!.status)
                        ? "Documento da proposta"
                        : "Documento da proposta em elaboração"}
                    </PanelSubtitulo>

                    {documentosVersao.length > 0 ? (
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
                    ) : mostrarFormularioUpload ? (
                      <p className="proposta-panel__hint">
                        Anexe o arquivo da proposta comercial para enviar para avaliação ou aprovar.
                      </p>
                    ) : (
                      <p className="proposta-panel__hint" role="status">
                        Nenhum documento nesta versão.
                      </p>
                    )}
                  </>
                ) : null}

                {mostrarFormularioUpload ? (
                  <div className="proposta-panel__upload">
                    <FormField label="Arquivo" htmlFor="prop-arquivo-upload">
                      <FieldControl
                        id="prop-arquivo-upload"
                        type="file"
                        className="clientes-input"
                        variant="modal"
                        accept=".pdf,.doc,.docx,image/jpeg,image/png"
                        onChange={(e) => setArquivoUpload(e.target.files?.[0] ?? null)}
                        disabled={processando}
                      />
                    </FormField>
                    <PrimaryButton disabled={processando || !arquivoUpload} onClick={() => void enviarDocumento()}>
                      Anexar arquivo
                    </PrimaryButton>
                  </div>
                ) : null}
              </PanelBloco>
            )}

            {documentosEnviadosHistorico.length > 0 ? (
              <PanelBloco embedded={embedded}>
                {!embedded && mostrarDocumentoVersaoAtual ? <AdminFormDivider /> : null}
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

            {rascunhoComAnexo ? (
              <PanelBloco embedded={embedded}>
                <PanelDivider embedded={embedded} />
                <div className="proposta-panel__acoes">
                  <GhostButton disabled={processando} onClick={() => void enviarParaAvaliacao()}>
                    Enviar para avaliação
                  </GhostButton>
                  <PrimaryButton disabled={processando} onClick={() => void aprovarProposta()}>
                    Aprovar
                  </PrimaryButton>
                </div>
              </PanelBloco>
            ) : null}

            {selecionada!.status === "PENDENTE_AVALIACAO_SOCIO" && isSocio ? (
              <PanelBloco embedded={embedded}>
                <PanelDivider embedded={embedded} />
                <div className="proposta-panel__acoes">
                  <PrimaryButton disabled={processando} onClick={() => void executarAcao("/aprovar-socio")}>
                    Aprovar (sócio)
                  </PrimaryButton>
                  <GhostButton disabled={processando} onClick={() => void executarAcao("/devolver-rascunho")}>
                    Devolver para rascunho
                  </GhostButton>
                </div>
              </PanelBloco>
            ) : null}

            {selecionada!.status === "APROVADA_INTERNA" && isAdmin ? (
              <PanelBloco embedded={embedded}>
                <PanelDivider embedded={embedded} />
                <PanelSubtitulo embedded={embedded}>Envio ao cliente</PanelSubtitulo>
                <p className="proposta-panel__hint">
                  A proposta foi aprovada internamente. Envie ao cliente para dar sequência ao fluxo.
                </p>
                <div className="proposta-panel__acoes">
                  <PrimaryButton disabled={processando} onClick={() => void executarAcao("/enviar-cliente")}>
                    Enviar ao cliente
                  </PrimaryButton>
                </div>
              </PanelBloco>
            ) : null}
          </>
        ) : null}
    </>
  );

  if (embedded) {
    return (
      <DashboardCard title="Proposta comercial" titleId="prop-sec-comercial" actions={acoesComercial}>
        {conteudo}
      </DashboardCard>
    );
  }

  return (
    <AdminFormSection title="Proposta comercial" titleId="prop-sec-comercial" actions={acoesComercial}>
      {conteudo}
    </AdminFormSection>
  );
});

export default PropostaPanel;
