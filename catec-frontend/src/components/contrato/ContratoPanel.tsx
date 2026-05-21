import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
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
import { DashboardCard, formatarDataCurta, InfoGrid, InfoItem } from "../projeto/detalhe/detalheUi";
import EmptyState from "../ui/EmptyState";
import InlineAlert from "../ui/InlineAlert";
import { mensagemErroApi } from "../../utils/apiError";
import { downloadDocumento } from "../../utils/downloadDocumento";
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
  const [arquivoUpload, setArquivoUpload] = useState<File | null>(null);

  const temAnexo = documentos.length > 0;
  const podeCriar = isAdmin && !contrato && !processando;
  const podeUpload =
    isAdmin &&
    contrato != null &&
    STATUS_CONTRATO_UPLOAD.includes(contrato.status) &&
    (contrato.status === "AGUARDANDO_AJUSTE_ADM" || !temAnexo);
  const podeEnviarCliente = isAdmin && contrato?.status === "RASCUNHO" && temAnexo && !processando;

  const carregarDocumentos = useCallback(
    async (contratoId: number) => {
      try {
        const res = await apiFetch(`/api/v1/projetos/${projetoId}/contratos/${contratoId}/documentos`);
        setDocumentos(res.ok ? ((await res.json()) as DocumentoAnexo[]) : []);
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
        await carregarDocumentos(atual.id);
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

  async function enviarDocumento() {
    if (!contrato || !arquivoUpload) return;
    setProcessando(true);
    setAcaoErro(null);
    const fd = new FormData();
    fd.append("file", arquivoUpload);
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
      setArquivoUpload(null);
      await carregarDocumentos(contrato.id);
    } catch {
      setAcaoErro("Falha de rede no upload.");
    } finally {
      setProcessando(false);
    }
  }

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
        <div className="proposta-panel__vazio">
          <EmptyState
            variant="inline"
            title="Nenhum contrato"
            description="Inicie o contrato para anexar o documento e encaminhar ao cliente."
          />
        </div>
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

          <AdminFormDivider />

          <p className="proposta-panel__subtitulo">Documento do contrato</p>

          {temAnexo ? (
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
          ) : podeUpload ? (
            <div className="proposta-panel__upload">
              <p className="proposta-panel__hint">Anexe o arquivo do contrato antes de enviar ao cliente.</p>
              <FormField label="Arquivo" htmlFor="cont-arquivo-upload">
                <FieldControl
                  id="cont-arquivo-upload"
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
          ) : (
            <p className="proposta-panel__hint" role="status">
              Nenhum documento anexado.
            </p>
          )}

          {podeEnviarCliente ? (
            <>
              <AdminFormDivider />
              <div className="proposta-panel__acoes">
                <PrimaryButton disabled={processando} onClick={() => void enviarAoCliente()}>
                  Enviar ao cliente
                </PrimaryButton>
              </div>
            </>
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
