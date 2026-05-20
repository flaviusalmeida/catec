import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import GhostButton from "../buttons/GhostButton";
import PrimaryButton from "../buttons/PrimaryButton";
import FieldControl from "../form/FieldControl";
import FormField from "../form/FormField";
import FormDialog from "../layout/FormDialog";
import ModalFooter from "../layout/ModalFooter";
import {
  AdminFormDivider,
  AdminFormFields,
  AdminFormSection,
} from "../layout/entityFormKit";
import EmptyState from "../ui/EmptyState";
import InlineAlert from "../ui/InlineAlert";
import { mensagemErroApi } from "../../utils/apiError";
import { downloadDocumento } from "../../utils/downloadDocumento";
import type {
  DocumentoAnexo,
  InteracaoFluxo,
  Proposta,
  PropostaStatus,
  TipoInteracaoFluxo,
} from "../../pages/propostaTypes";
import {
  STATUS_PROPOSTA_ENVIADA,
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

type DocumentoHistorico = DocumentoAnexo & {
  propostaId: number;
  propostaVersao: number;
  propostaStatus: PropostaStatus;
};

type InteracaoHistorico = InteracaoFluxo & {
  propostaId: number;
  propostaVersao: number;
};

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

export default function PropostaPanel({ projetoId, projetoTemCliente, onPropostaAtualizada }: Props) {
  const { isAdmin, isSocio, logout } = useAuth();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
  const [documentosVersao, setDocumentosVersao] = useState<DocumentoAnexo[]>([]);
  const [documentosEnviados, setDocumentosEnviados] = useState<DocumentoHistorico[]>([]);
  const [interacoesHistorico, setInteracoesHistorico] = useState<InteracaoHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoErro, setAcaoErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [arquivoUpload, setArquivoUpload] = useState<File | null>(null);
  const [tipoInteracao, setTipoInteracao] = useState<TipoInteracaoFluxo>("CONSIDERACOES_CLIENTE");
  const [textoInteracao, setTextoInteracao] = useState("");
  const [modalRespostaAberto, setModalRespostaAberto] = useState(false);

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

  const propostaParaResposta =
    propostas.find((p) => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null;

  const carregarHistorico = useCallback(
    async (lista: Proposta[], propostaSelecionadaId: number | null) => {
      if (lista.length === 0) {
        setDocumentosVersao([]);
        setDocumentosEnviados([]);
        setInteracoesHistorico([]);
        return;
      }

      try {
        const detalhes = await Promise.all(
          lista.map(async (p) => {
            const [resDoc, resInt] = await Promise.all([
              apiFetch(`/api/v1/projetos/${projetoId}/propostas/${p.id}/documentos`),
              apiFetch(`/api/v1/projetos/${projetoId}/propostas/${p.id}/interacoes`),
            ]);
            const docs = resDoc.ok ? ((await resDoc.json()) as DocumentoAnexo[]) : [];
            const ints = resInt.ok ? ((await resInt.json()) as InteracaoFluxo[]) : [];
            return { proposta: p, docs, ints };
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

        const interacoes: InteracaoHistorico[] = detalhes
          .flatMap((d) =>
            d.ints.map((i) => ({
              ...i,
              propostaId: d.proposta.id,
              propostaVersao: d.proposta.versao,
            })),
          )
          .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

        setInteracoesHistorico(interacoes);
      } catch {
        setDocumentosVersao([]);
        setDocumentosEnviados([]);
        setInteracoesHistorico([]);
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

  async function registrarRespostaCliente() {
    if (!propostaParaResposta || !textoInteracao.trim()) {
      setAcaoErro("Informe o texto do registro.");
      return;
    }
    setProcessando(true);
    setAcaoErro(null);
    try {
      const res = await apiFetch(
        `/api/v1/projetos/${projetoId}/propostas/${propostaParaResposta.id}/interacoes`,
        {
          method: "POST",
          body: JSON.stringify({ tipoInteracao, texto: textoInteracao.trim() }),
        },
      );
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Erro ao registrar resposta"));
        return;
      }
      setTextoInteracao("");
      setTipoInteracao("CONSIDERACOES_CLIENTE");
      setModalRespostaAberto(false);
      await recarregarTudo(selecionadaId ?? propostaParaResposta.id);
      onPropostaAtualizada?.();
    } catch {
      setAcaoErro("Falha de rede ao registrar.");
    } finally {
      setProcessando(false);
    }
  }

  function fecharModalResposta() {
    if (processando) return;
    setModalRespostaAberto(false);
    setTextoInteracao("");
    setTipoInteracao("CONSIDERACOES_CLIENTE");
  }

  const podeUpload = isAdmin && selecionada && STATUS_PROPOSTA_UPLOAD.includes(selecionada.status);
  const mostrarFormularioUpload = podeUpload && selecionada?.status === "RASCUNHO" && !temAnexo;
  const podeRespostaCliente = isAdmin && propostaParaResposta != null;
  const mostrarProposta = !carregando && propostas.length > 0 && selecionada != null;
  const documentosEnviadosHistorico =
    selecionadaId != null
      ? documentosEnviados.filter((d) => d.propostaId !== selecionadaId)
      : documentosEnviados;

  const mostrarRespostaCliente =
    mostrarProposta &&
    (documentosEnviados.length > 0 ||
      interacoesHistorico.length > 0 ||
      propostas.some((p) => STATUS_PROPOSTA_ENVIADA.includes(p.status)));

  const rascunhoComAnexo = isAdmin && selecionada?.status === "RASCUNHO" && temAnexo;

  const elaboracaoTexto = selecionada ? selecionada.elaboradoPorNome : "";

  const mostrarDocumentoVersaoAtual = selecionada != null;

  function baixarDocumento(doc: DocumentoAnexo) {
    void downloadDocumento(doc.id, doc.nomeOriginal).catch(() => setAcaoErro("Download falhou."));
  }

  const acoesComercial = podeCriarNova ? (
    <PrimaryButton variant="toolbar" onClick={() => void criarProposta()} disabled={processando}>
      Nova
    </PrimaryButton>
  ) : undefined;

  const acoesResposta = podeRespostaCliente ? (
    <PrimaryButton
      variant="toolbar"
      onClick={() => {
        setAcaoErro(null);
        setModalRespostaAberto(true);
      }}
      disabled={processando}
    >
      Registrar
    </PrimaryButton>
  ) : undefined;

  return (
    <>
      <AdminFormSection title="Proposta comercial" titleId="prop-sec-comercial" actions={acoesComercial}>
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

            {mostrarDocumentoVersaoAtual || mostrarFormularioUpload || documentosEnviadosHistorico.length > 0 ? (
              <AdminFormDivider />
            ) : null}

            {mostrarDocumentoVersaoAtual ? (
              <>
                <p className="proposta-panel__subtitulo">
                  {STATUS_PROPOSTA_ENVIADA.includes(selecionada!.status)
                    ? "Documento da proposta"
                    : "Documento da proposta em elaboração"}
                </p>

                {documentosVersao.length > 0 ? (
                  <ul className="proposta-panel__lista proposta-panel__lista--documento">
                    {documentosVersao.map((d) => (
                      <li key={d.id}>
                        <span className="proposta-panel__doc-nome">
                          {d.nomeOriginal} (v{selecionada!.versao})
                        </span>
                        <GhostButton onClick={() => baixarDocumento(d)}>Baixar</GhostButton>
                      </li>
                    ))}
                  </ul>
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

            {documentosEnviadosHistorico.length > 0 ? (
              <>
                {mostrarDocumentoVersaoAtual ? <AdminFormDivider /> : null}
                <p className="proposta-panel__subtitulo">Versões anteriores</p>
                <ul className="proposta-panel__lista proposta-panel__lista--historico">
                  {documentosEnviadosHistorico.map((d) => {
                    const propostaRef = propostas.find((p) => p.id === d.propostaId);
                    if (!propostaRef) return null;
                    return (
                      <li key={`${d.propostaId}-${d.id}`}>
                        <span className="proposta-panel__lista-texto">
                          <span className="proposta-panel__lista-titulo">
                            {tituloHistoricoProposta(propostaRef)}
                          </span>
                          <span className="proposta-panel__lista-detalhe">{d.nomeOriginal}</span>
                        </span>
                        <GhostButton onClick={() => baixarDocumento(d)}>Baixar</GhostButton>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}

            {rascunhoComAnexo ? (
              <>
                <AdminFormDivider />
                <div className="proposta-panel__acoes">
                  <GhostButton disabled={processando} onClick={() => void enviarParaAvaliacao()}>
                    Enviar para avaliação
                  </GhostButton>
                  <PrimaryButton disabled={processando} onClick={() => void aprovarProposta()}>
                    Aprovar
                  </PrimaryButton>
                </div>
              </>
            ) : null}

            {selecionada!.status === "PENDENTE_AVALIACAO_SOCIO" && isSocio ? (
              <>
                <AdminFormDivider />
                <div className="proposta-panel__acoes">
                  <PrimaryButton disabled={processando} onClick={() => void executarAcao("/aprovar-socio")}>
                    Aprovar (sócio)
                  </PrimaryButton>
                  <GhostButton disabled={processando} onClick={() => void executarAcao("/devolver-rascunho")}>
                    Devolver para rascunho
                  </GhostButton>
                </div>
              </>
            ) : null}

            {selecionada!.status === "APROVADA_INTERNA" && isAdmin ? (
              <>
                <AdminFormDivider />
                <p className="proposta-panel__subtitulo">Envio ao cliente</p>
                <p className="proposta-panel__hint">
                  A proposta foi aprovada internamente. Envie ao cliente para dar sequência ao fluxo.
                </p>
                <div className="proposta-panel__acoes">
                  <PrimaryButton disabled={processando} onClick={() => void executarAcao("/enviar-cliente")}>
                    Enviar ao cliente
                  </PrimaryButton>
                </div>
              </>
            ) : null}
          </AdminFormFields>
        ) : null}
      </AdminFormSection>

      {mostrarRespostaCliente ? (
        <AdminFormSection title="Resposta do cliente" titleId="prop-sec-resposta" actions={acoesResposta}>
          {interacoesHistorico.length > 0 ? (
            <ul className="proposta-panel__interacoes">
              {interacoesHistorico.map((i) => (
                <li key={i.id}>
                  <strong>
                    {TIPO_INTERACAO_ROTULO[i.tipoInteracao]}
                    <span className="proposta-panel__interacao-versao"> · v{i.propostaVersao}</span>
                  </strong>
                  <span className="proposta-panel__interacao-meta">
                    {i.registradoPorNome} · {formatarDataHora(i.criadoEm)}
                  </span>
                  <p>{i.texto}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="proposta-panel__hint" role="status">
              Nenhum registro da resposta do cliente ainda.
            </p>
          )}
        </AdminFormSection>
      ) : null}

      <FormDialog
        open={modalRespostaAberto}
        titleId="prop-modal-resposta-titulo"
        title="Registrar resposta do cliente"
        panelClassName="proposta-resposta-dialog"
        onBackdropClick={fecharModalResposta}
      >
        {acaoErro && modalRespostaAberto ? <InlineAlert variant="error">{acaoErro}</InlineAlert> : null}
        {propostaParaResposta ? (
          <p className="proposta-panel__hint">
            Registro vinculado à <strong>v{propostaParaResposta.versao}</strong> (
            {STATUS_PROPOSTA_ROTULO[propostaParaResposta.status]}).
          </p>
        ) : null}
        <AdminFormFields>
          <FormField label="Tipo" htmlFor="tipo-interacao-modal">
            <FieldControl
              as="select"
              id="tipo-interacao-modal"
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
          <FormField label="Texto / motivo" htmlFor="texto-interacao-modal" required>
            <FieldControl
              as="textarea"
              id="texto-interacao-modal"
              className="clientes-input clientes-textarea"
              variant="modal"
              value={textoInteracao}
              onChange={(e) => setTextoInteracao(e.target.value)}
              disabled={processando}
              rows={4}
            />
          </FormField>
        </AdminFormFields>
        <ModalFooter>
          <GhostButton onClick={fecharModalResposta} disabled={processando}>
            Cancelar
          </GhostButton>
          <PrimaryButton disabled={processando} onClick={() => void registrarRespostaCliente()}>
            {processando ? "Registrando…" : "Registrar"}
          </PrimaryButton>
        </ModalFooter>
      </FormDialog>
    </>
  );
}
