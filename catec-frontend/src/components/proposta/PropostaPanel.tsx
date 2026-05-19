import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import GhostButton from "../buttons/GhostButton";
import PrimaryButton from "../buttons/PrimaryButton";
import FieldControl from "../form/FieldControl";
import FormField from "../form/FormField";
import ModalFormGrid from "../layout/ModalFormGrid";
import {
  AdminFormDivider,
  AdminFormFields,
  AdminFormSection,
} from "../layout/entityFormKit";
import EmptyState from "../ui/EmptyState";
import InlineAlert from "../ui/InlineAlert";
import LabeledSwitch from "../ui/LabeledSwitch";
import { mensagemErroApi } from "../../utils/apiError";
import { downloadDocumento } from "../../utils/downloadDocumento";
import type {
  DocumentoAnexo,
  InteracaoFluxo,
  Proposta,
  TipoInteracaoFluxo,
} from "../../pages/propostaTypes";
import {
  STATUS_PROPOSTA_RESPOSTA_CLIENTE,
  STATUS_PROPOSTA_ROTULO,
  STATUS_PROPOSTA_UPLOAD,
  TIPO_INTERACAO_ROTULO,
} from "../../pages/propostaTypes";
import "../../pages/ClientesPage.css";
import "./PropostaPanel.css";

type Props = {
  projetoId: number;
  projetoTemCliente: boolean;
  onPropostaAtualizada?: () => void;
};

export default function PropostaPanel({ projetoId, projetoTemCliente, onPropostaAtualizada }: Props) {
  const { isAdmin, isSocio, logout } = useAuth();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoAnexo[]>([]);
  const [interacoes, setInteracoes] = useState<InteracaoFluxo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoErro, setAcaoErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [requerSocio, setRequerSocio] = useState(false);
  const [arquivoUpload, setArquivoUpload] = useState<File | null>(null);
  const [tipoInteracao, setTipoInteracao] = useState<TipoInteracaoFluxo>("CONSIDERACOES_CLIENTE");
  const [textoInteracao, setTextoInteracao] = useState("");

  const selecionada = propostas.find((p) => p.id === selecionadaId) ?? null;

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
      setSelecionadaId((atual) => {
        if (lista.length === 0) return null;
        if (atual != null && lista.some((p) => p.id === atual)) return atual;
        return lista[0].id;
      });
    } catch {
      setErro("Falha de rede ao carregar propostas.");
    } finally {
      setCarregando(false);
    }
  }, [projetoId, logout]);

  const carregarDetalhe = useCallback(
    async (propostaId: number) => {
      try {
        const [resDoc, resInt] = await Promise.all([
          apiFetch(`/api/v1/projetos/${projetoId}/propostas/${propostaId}/documentos`),
          apiFetch(`/api/v1/projetos/${projetoId}/propostas/${propostaId}/interacoes`),
        ]);
        if (resDoc.ok) setDocumentos((await resDoc.json()) as DocumentoAnexo[]);
        else setDocumentos([]);
        if (resInt.ok) setInteracoes((await resInt.json()) as InteracaoFluxo[]);
        else setInteracoes([]);
      } catch {
        setDocumentos([]);
        setInteracoes([]);
      }
    },
    [projetoId],
  );

  useEffect(() => {
    void carregarPropostas();
  }, [carregarPropostas]);

  useEffect(() => {
    if (selecionadaId != null) void carregarDetalhe(selecionadaId);
  }, [selecionadaId, carregarDetalhe]);

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
      await carregarPropostas();
      await carregarDetalhe(selecionadaId);
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
    if (!isAdmin || !projetoTemCliente) return;
    setProcessando(true);
    setAcaoErro(null);
    try {
      const res = await apiFetch(`/api/v1/projetos/${projetoId}/propostas`, {
        method: "POST",
        body: JSON.stringify({ requerAvaliacaoSocio: requerSocio }),
      });
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Erro ao criar proposta"));
        return;
      }
      const nova = (await res.json()) as Proposta;
      setSelecionadaId(nova.id);
      await carregarPropostas();
      onPropostaAtualizada?.();
    } catch {
      setAcaoErro("Falha de rede ao criar proposta.");
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
      await carregarDetalhe(selecionadaId);
    } catch {
      setAcaoErro("Falha de rede no upload.");
    } finally {
      setProcessando(false);
    }
  }

  async function registrarRespostaCliente() {
    if (!selecionadaId || !textoInteracao.trim()) {
      setAcaoErro("Informe o texto do registro.");
      return;
    }
    setProcessando(true);
    setAcaoErro(null);
    try {
      const res = await apiFetch(`/api/v1/projetos/${projetoId}/propostas/${selecionadaId}/interacoes`, {
        method: "POST",
        body: JSON.stringify({ tipoInteracao, texto: textoInteracao.trim() }),
      });
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Erro ao registrar resposta"));
        return;
      }
      setTextoInteracao("");
      await carregarPropostas();
      await carregarDetalhe(selecionadaId);
      onPropostaAtualizada?.();
    } catch {
      setAcaoErro("Falha de rede ao registrar.");
    } finally {
      setProcessando(false);
    }
  }

  const podeUpload = isAdmin && selecionada && STATUS_PROPOSTA_UPLOAD.includes(selecionada.status);
  const podeRespostaCliente =
    isAdmin && selecionada && STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(selecionada.status);

  const mostrarDetalhe = !carregando && propostas.length > 0 && selecionada != null;
  const elaboracaoTexto = selecionada
    ? `${selecionada.elaboradoPorNome}${selecionada.requerAvaliacaoSocio ? " · Exige parecer do sócio" : ""}`
    : "";

  return (
    <>
      <AdminFormSection title="Proposta comercial" titleId="prop-sec-comercial">
        {isAdmin && projetoTemCliente ? (
          <div className="proposta-panel__toolbar">
            <LabeledSwitch
              id="prop-requer-socio"
              label="Requer avaliação do sócio"
              checked={requerSocio}
              onChange={setRequerSocio}
              disabled={processando}
            />
            <PrimaryButton variant="toolbar" onClick={() => void criarProposta()} disabled={processando}>
              Nova proposta
            </PrimaryButton>
          </div>
        ) : null}

        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}
        {acaoErro ? <InlineAlert variant="error">{acaoErro}</InlineAlert> : null}

        {carregando ? (
          <p className="admin-entity-form-loading" role="status">
            Carregando propostas…
          </p>
        ) : propostas.length === 0 ? (
          <EmptyState
            variant="inline"
            title="Nenhuma proposta"
            description={
              projetoTemCliente
                ? "O administrativo pode iniciar uma nova proposta comercial neste projeto."
                : "Associe um cliente ao projeto antes de criar a proposta comercial."
            }
          />
        ) : (
          <AdminFormFields>
            <ModalFormGrid balanced>
              <FormField label="Versão" htmlFor="sel-proposta">
                <FieldControl
                  as="select"
                  id="sel-proposta"
                  className="clientes-select"
                  variant="modal"
                  value={selecionadaId ?? ""}
                  onChange={(e) => setSelecionadaId(Number(e.target.value))}
                  disabled={processando}
                >
                  {propostas.map((p) => (
                    <option key={p.id} value={p.id}>
                      v{p.versao} — {STATUS_PROPOSTA_ROTULO[p.status]}
                    </option>
                  ))}
                </FieldControl>
              </FormField>
              {selecionada ? (
                <FormField label="Status" htmlFor="prop-status">
                  <FieldControl
                    id="prop-status"
                    className="clientes-input"
                    variant="modal"
                    readOnly
                    value={STATUS_PROPOSTA_ROTULO[selecionada.status]}
                  />
                </FormField>
              ) : null}
            </ModalFormGrid>

            {selecionada ? (
              <FormField label="Elaboração" htmlFor="prop-elaboracao">
                <FieldControl
                  id="prop-elaboracao"
                  className="clientes-input"
                  variant="modal"
                  readOnly
                  value={elaboracaoTexto}
                />
              </FormField>
            ) : null}

            {mostrarDetalhe ? (
              <div className="proposta-panel__acoes">
                {isAdmin && selecionada!.status === "RASCUNHO" && selecionada!.requerAvaliacaoSocio ? (
                  <GhostButton
                    disabled={processando}
                    onClick={() => void executarAcao("/submeter-avaliacao-socio")}
                  >
                    Submeter ao sócio
                  </GhostButton>
                ) : null}
                {isAdmin && selecionada!.status === "RASCUNHO" && !selecionada!.requerAvaliacaoSocio ? (
                  <GhostButton disabled={processando} onClick={() => void executarAcao("/aprovar-interna")}>
                    Aprovar internamente
                  </GhostButton>
                ) : null}
                {isSocio && selecionada!.status === "PENDENTE_AVALIACAO_SOCIO" ? (
                  <>
                    <PrimaryButton disabled={processando} onClick={() => void executarAcao("/aprovar-socio")}>
                      Aprovar (sócio)
                    </PrimaryButton>
                    <GhostButton disabled={processando} onClick={() => void executarAcao("/devolver-rascunho")}>
                      Devolver para rascunho
                    </GhostButton>
                  </>
                ) : null}
                {isAdmin && selecionada!.status === "APROVADA_INTERNA" ? (
                  <PrimaryButton disabled={processando} onClick={() => void executarAcao("/enviar-cliente")}>
                    Enviar ao cliente
                  </PrimaryButton>
                ) : null}
              </div>
            ) : null}
          </AdminFormFields>
        )}
      </AdminFormSection>

      {mostrarDetalhe ? (
        <>
          <AdminFormSection title="Documentos" titleId="prop-sec-docs">
            <AdminFormFields>
              {documentos.length === 0 ? (
                <EmptyState
                  variant="inline"
                  title="Nenhum anexo"
                  description="Anexe arquivos da proposta comercial quando permitido."
                />
              ) : (
                <ul className="proposta-panel__lista">
                  {documentos.map((d) => (
                    <li key={d.id}>
                      <span>
                        {d.nomeOriginal} (v{d.versao})
                      </span>
                      <GhostButton
                        onClick={() =>
                          void downloadDocumento(d.id, d.nomeOriginal).catch(() =>
                            setAcaoErro("Download falhou."),
                          )
                        }
                      >
                        Baixar
                      </GhostButton>
                    </li>
                  ))}
                </ul>
              )}
              {podeUpload ? (
                <>
                  <AdminFormDivider />
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
                </>
              ) : null}
            </AdminFormFields>
          </AdminFormSection>

          <AdminFormSection title="Resposta do cliente" titleId="prop-sec-resposta">
            <AdminFormFields>
              {interacoes.length > 0 ? (
                <ul className="proposta-panel__interacoes">
                  {interacoes.map((i) => (
                    <li key={i.id}>
                      <strong>{TIPO_INTERACAO_ROTULO[i.tipoInteracao]}</strong>
                      <span className="proposta-panel__interacao-meta">
                        {i.registradoPorNome} · {new Date(i.criadoEm).toLocaleString("pt-BR")}
                      </span>
                      <p>{i.texto}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  variant="inline"
                  title="Nenhum registro"
                  description="Registros internos da resposta do cliente aparecem aqui."
                />
              )}

              {podeRespostaCliente ? (
                <>
                  <AdminFormDivider />
                  <ModalFormGrid balanced>
                    <FormField label="Tipo" htmlFor="tipo-interacao">
                      <FieldControl
                        as="select"
                        id="tipo-interacao"
                        className="clientes-select"
                        variant="modal"
                        value={tipoInteracao}
                        onChange={(e) => setTipoInteracao(e.target.value as TipoInteracaoFluxo)}
                        disabled={processando}
                      >
                        {(Object.keys(TIPO_INTERACAO_ROTULO) as TipoInteracaoFluxo[]).map((t) => (
                          <option key={t} value={t}>
                            {TIPO_INTERACAO_ROTULO[t]}
                          </option>
                        ))}
                      </FieldControl>
                    </FormField>
                  </ModalFormGrid>
                  <FormField label="Texto / motivo" htmlFor="texto-interacao" required>
                    <FieldControl
                      as="textarea"
                      id="texto-interacao"
                      className="clientes-input clientes-textarea"
                      variant="modal"
                      value={textoInteracao}
                      onChange={(e) => setTextoInteracao(e.target.value)}
                      disabled={processando}
                      rows={4}
                    />
                  </FormField>
                  <PrimaryButton disabled={processando} onClick={() => void registrarRespostaCliente()}>
                    Registrar resposta do cliente
                  </PrimaryButton>
                </>
              ) : null}
            </AdminFormFields>
          </AdminFormSection>
        </>
      ) : null}
    </>
  );
}
