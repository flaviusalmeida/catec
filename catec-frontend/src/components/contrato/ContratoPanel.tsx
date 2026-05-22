import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
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
import { DashboardCard, formatarDataCurta, InfoGrid, InfoItem, SectionLabel } from "../projeto/detalhe/detalheUi";
import { STATE_EMPTY_CONTRATO } from "../projeto/detalhe/stateMessages";
import StateCard from "../ui/StateCard";
import UploadCard from "../ui/UploadCard";
import InlineAlert from "../ui/InlineAlert";
import { mensagemErroApi } from "../../utils/apiError";
import { downloadDocumento } from "../../utils/downloadDocumento";
import { documentoMaisRecente, documentosParaExibicao } from "../../utils/documentoUtils";
import type { DocumentoAnexo } from "../../pages/propostaTypes";
import type { Contrato } from "../../pages/contratoTypes";
import { STATUS_CONTRATO_ROTULO, STATUS_CONTRATO_UPLOAD } from "../../pages/contratoTypes";
import "../../pages/ClientesPage.css";
import "../proposta/PropostaPanel.css";

export type ContratoPanelHandle = {
  criarContrato: () => void;
  podeCriar: boolean;
};

type Props = {
  projetoId: number;
  onContratoAtualizado?: () => void;
  embedded?: boolean;
  hideHeaderActions?: boolean;
};

const ContratoPanel = forwardRef<ContratoPanelHandle, Props>(function ContratoPanel(
  { projetoId, onContratoAtualizado, embedded = false, hideHeaderActions = false },
  ref,
) {
  const { isAdmin, logout } = useAuth();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoAnexo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoErro, setAcaoErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const uploadEmAndamentoRef = useRef(false);

  const temAnexo = documentos.length > 0;
  const podeCriar = isAdmin && !contrato && !processando;
  const podeUpload =
    isAdmin &&
    contrato != null &&
    STATUS_CONTRATO_UPLOAD.includes(contrato.status) &&
    (contrato.status === "RASCUNHO" ||
      contrato.status === "AGUARDANDO_AJUSTE_ADM" ||
      !temAnexo);
  const podeEnviarCliente = isAdmin && contrato?.status === "RASCUNHO" && temAnexo && !processando;

  const carregarDocumentos = useCallback(
    async (contratoId: number, status: Contrato["status"] | undefined) => {
      try {
        const res = await apiFetch(`/api/v1/projetos/${projetoId}/contratos/${contratoId}/documentos`);
        const docs = res.ok ? ((await res.json()) as DocumentoAnexo[]) : [];
        setDocumentos(documentosParaExibicao(docs, status === "RASCUNHO"));
      } catch {
        setDocumentos([]);
      }
    },
    [projetoId],
  );

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/projetos/${projetoId}/contratos`);
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setErro(await mensagemErroApi(res, "Erro ao carregar contrato"));
        setContrato(null);
        setDocumentos([]);
        return;
      }
      const lista = (await res.json()) as Contrato[];
      const atual = lista[0] ?? null;
      setContrato(atual);
      setAcaoErro(null);
      if (atual) {
        await carregarDocumentos(atual.id, atual.status);
      } else {
        setDocumentos([]);
      }
    } catch {
      setErro("Falha de rede ao carregar contrato.");
    } finally {
      setCarregando(false);
    }
  }, [projetoId, logout, carregarDocumentos]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function criarContrato() {
    if (!podeCriar) return;
    setProcessando(true);
    setAcaoErro(null);
    try {
      const res = await apiFetch(`/api/v1/projetos/${projetoId}/contratos`, { method: "POST" });
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Erro ao iniciar contrato"));
        return;
      }
      await carregar();
      onContratoAtualizado?.();
    } catch {
      setAcaoErro("Falha de rede ao iniciar contrato.");
    } finally {
      setProcessando(false);
    }
  }

  async function enviarDocumento(arquivo: File) {
    if (!contrato || uploadEmAndamentoRef.current) return;
    uploadEmAndamentoRef.current = true;
    setProcessando(true);
    setAcaoErro(null);
    const fd = new FormData();
    fd.append("file", arquivo);
    fd.append("tipoArquivo", "CONTRATO");
    try {
      const res = await apiFetch(
        `/api/v1/projetos/${projetoId}/contratos/${contrato.id}/documentos`,
        { method: "POST", body: fd },
      );
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Erro no upload"));
        return;
      }
      await carregarDocumentos(contrato.id, contrato.status);
      onContratoAtualizado?.();
    } catch {
      setAcaoErro("Falha de rede no upload.");
    } finally {
      uploadEmAndamentoRef.current = false;
      setProcessando(false);
    }
  }

  const documentoAtual = documentoMaisRecente(documentos);
  const uploadComSubstituicao = Boolean(
    podeUpload &&
      (contrato?.status === "RASCUNHO" ||
        contrato?.status === "AGUARDANDO_AJUSTE_ADM" ||
        !temAnexo),
  );

  async function enviarAoCliente() {
    if (!contrato || !podeEnviarCliente) return;
    setProcessando(true);
    setAcaoErro(null);
    try {
      const res = await apiFetch(
        `/api/v1/projetos/${projetoId}/contratos/${contrato.id}/enviar-cliente`,
        { method: "POST" },
      );
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Não foi possível enviar ao cliente"));
        return;
      }
      await carregar();
      onContratoAtualizado?.();
    } catch {
      setAcaoErro("Falha de rede ao enviar.");
    } finally {
      setProcessando(false);
    }
  }

  function baixarDocumento(doc: DocumentoAnexo) {
    void downloadDocumento(doc.id, doc.nomeOriginal).catch(() => setAcaoErro("Download falhou."));
  }

  useImperativeHandle(ref, () => ({
    criarContrato: () => void criarContrato(),
    podeCriar,
  }));

  const acoesNova =
    !hideHeaderActions && podeCriar ? (
      <PrimaryButton variant="toolbar" onClick={() => void criarContrato()} disabled={processando}>
        Nova
      </PrimaryButton>
    ) : undefined;

  const conteudo = (
    <>
      {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}
      {acaoErro ? <InlineAlert variant="error">{acaoErro}</InlineAlert> : null}

      {carregando ? (
        <p className="admin-entity-form-loading" role="status">
          Carregando contrato…
        </p>
      ) : !contrato ? (
        <StateCard type="empty" title={STATE_EMPTY_CONTRATO} />
      ) : (
        <>
          {embedded ? (
            <InfoGrid>
              <InfoItem label="Status">{STATUS_CONTRATO_ROTULO[contrato.status]}</InfoItem>
              <InfoItem label="Elaborado por">{contrato.elaboradoPorNome || "—"}</InfoItem>
            </InfoGrid>
          ) : (
            <AdminFormFields>
              <FormField label="Status" htmlFor="cont-status">
                <FieldControl
                  id="cont-status"
                  className="clientes-input"
                  variant="modal"
                  readOnly
                  value={STATUS_CONTRATO_ROTULO[contrato.status]}
                />
              </FormField>

              <FormField label="Elaboração" htmlFor="cont-elaboracao">
                <FieldControl
                  id="cont-elaboracao"
                  className="clientes-input"
                  variant="modal"
                  readOnly
                  value={contrato.elaboradoPorNome}
                />
              </FormField>
            </AdminFormFields>
          )}

          {uploadComSubstituicao ? (
            embedded ? (
              <div className="proj-detalhe-block">
                <UploadCard
                  title="Enviar contrato"
                  file={
                    documentoAtual
                      ? {
                          nomeArquivo: documentoAtual.nomeOriginal,
                          meta: `Versão ${documentoAtual.versao}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ""}${documentoAtual.uploadedPorNome ? ` • ${documentoAtual.uploadedPorNome}` : ""}`,
                        }
                      : null
                  }
                  documentSectionTitle={documentoAtual ? "Documento do contrato" : undefined}
                  uploading={processando}
                  disabled={processando}
                  onUpload={(arquivo) => void enviarDocumento(arquivo)}
                  onDownload={documentoAtual ? () => baixarDocumento(documentoAtual) : undefined}
                  onError={setAcaoErro}
                  inputId="cont-arquivo-upload"
                />
              </div>
            ) : (
              <>
                <AdminFormDivider />
                <UploadCard
                  title="Enviar contrato"
                  file={
                    documentoAtual
                      ? {
                          nomeArquivo: documentoAtual.nomeOriginal,
                          meta: `Versão ${documentoAtual.versao}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ""}${documentoAtual.uploadedPorNome ? ` • ${documentoAtual.uploadedPorNome}` : ""}`,
                        }
                      : null
                  }
                  documentSectionTitle={documentoAtual ? "Documento do contrato" : undefined}
                  uploading={processando}
                  disabled={processando}
                  onUpload={(arquivo) => void enviarDocumento(arquivo)}
                  onDownload={documentoAtual ? () => baixarDocumento(documentoAtual) : undefined}
                  onError={setAcaoErro}
                  inputId="cont-arquivo-upload-standalone"
                />
              </>
            )
          ) : temAnexo ? (
            embedded ? (
              <div className="proj-detalhe-block">
                <SectionLabel>Documento do contrato</SectionLabel>
                <div className="proj-detalhe-file-rows">
                  {documentos.map((d) => (
                    <FileRow
                      key={d.id}
                      nomeArquivo={d.nomeOriginal}
                      meta={`Versão ${d.versao}${d.criadoEm ? ` • ${formatarDataCurta(d.criadoEm)}` : ""}${d.uploadedPorNome ? ` • ${d.uploadedPorNome}` : ""}`}
                      onDownload={() => baixarDocumento(d)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <AdminFormDivider />
                <p className="proposta-panel__subtitulo">Documento do contrato</p>
                <div className="proj-detalhe-file-rows">
                  {documentos.map((d) => (
                    <FileRow
                      key={d.id}
                      nomeArquivo={d.nomeOriginal}
                      meta={`Versão ${d.versao}${d.criadoEm ? ` • ${formatarDataCurta(d.criadoEm)}` : ""}${d.uploadedPorNome ? ` • ${d.uploadedPorNome}` : ""}`}
                      onDownload={() => baixarDocumento(d)}
                    />
                  ))}
                </div>
              </>
            )
          ) : null}

          {podeEnviarCliente ? (
            embedded ? (
              <div className="proj-detalhe-block">
                <div className="proposta-panel__acoes">
                  <PrimaryButton disabled={processando} onClick={() => void enviarAoCliente()}>
                    Enviar ao cliente
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <>
                <AdminFormDivider />
                <div className="proposta-panel__acoes">
                  <PrimaryButton disabled={processando} onClick={() => void enviarAoCliente()}>
                    Enviar ao cliente
                  </PrimaryButton>
                </div>
              </>
            )
          ) : null}
        </>
      )}
    </>
  );

  if (embedded) {
    return (
      <DashboardCard title="Contrato" titleId="cont-sec-principal" actions={acoesNova}>
        {conteudo}
      </DashboardCard>
    );
  }

  return (
    <AdminFormSection title="Contrato" titleId="cont-sec-principal" actions={acoesNova}>
      {conteudo}
    </AdminFormSection>
  );
});

export default ContratoPanel;
