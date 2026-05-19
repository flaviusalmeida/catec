import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import GhostButton from "../buttons/GhostButton";
import PrimaryButton from "../buttons/PrimaryButton";
import FieldControl from "../form/FieldControl";
import FormField from "../form/FormField";
import ModalSection from "../layout/ModalSection";
import InlineAlert from "../ui/InlineAlert";
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
  STATUS_PROPOSTA_UPLOAD,
  TIPO_INTERACAO_ROTULO,
} from "../../pages/propostaTypes";
import PropostaStatusBadge from "./PropostaStatusBadge";
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

  async function executarAcao(
    path: string,
    metodo: "POST" = "POST",
    sucessoMsg?: string,
    body?: unknown,
  ): Promise<boolean> {
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
      if (sucessoMsg) {
        /* feedback via recarga */
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

  return (
    <section className="proposta-panel" aria-labelledby="proposta-panel-heading">
      <div className="proposta-panel__head">
        <h2 id="proposta-panel-heading" className="proposta-panel__title">
          Proposta comercial
        </h2>
        {isAdmin && projetoTemCliente ? (
          <div className="proposta-panel__criar">
            <label className="proposta-panel__check">
              <input
                type="checkbox"
                checked={requerSocio}
                onChange={(e) => setRequerSocio(e.target.checked)}
                disabled={processando}
              />
              Requer avaliação do sócio
            </label>
            <PrimaryButton variant="toolbar" onClick={() => void criarProposta()} disabled={processando}>
              Nova proposta
            </PrimaryButton>
          </div>
        ) : null}
      </div>

      {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}
      {acaoErro ? <InlineAlert variant="error">{acaoErro}</InlineAlert> : null}

      {carregando ? (
        <p className="proposta-panel__hint" role="status">
          Carregando propostas…
        </p>
      ) : propostas.length === 0 ? (
        <p className="proposta-panel__hint">
          {projetoTemCliente
            ? "Nenhuma proposta neste projeto. O administrativo pode iniciar uma nova."
            : "Associe um cliente ao projeto antes de criar a proposta comercial."}
        </p>
      ) : (
        <>
          <div className="proposta-panel__versoes">
            <label className="filters-card__label" htmlFor="sel-proposta">
              Versão
            </label>
            <FieldControl
              as="select"
              id="sel-proposta"
              className="clientes-select"
              value={selecionadaId ?? ""}
              onChange={(e) => setSelecionadaId(Number(e.target.value))}
            >
              {propostas.map((p) => (
                <option key={p.id} value={p.id}>
                  v{p.versao} — {p.status}
                </option>
              ))}
            </FieldControl>
          </div>

          {selecionada ? (
            <div className="proposta-panel__detalhe">
              <p className="proposta-panel__meta">
                Elaborada por <strong>{selecionada.elaboradoPorNome}</strong>
                {selecionada.requerAvaliacaoSocio ? " · Exige parecer do sócio" : null}
              </p>
              <PropostaStatusBadge status={selecionada.status} />

              <div className="proposta-panel__acoes">
                {isAdmin && selecionada.status === "RASCUNHO" && selecionada.requerAvaliacaoSocio ? (
                  <GhostButton
                    disabled={processando}
                    onClick={() => void executarAcao("/submeter-avaliacao-socio")}
                  >
                    Submeter ao sócio
                  </GhostButton>
                ) : null}
                {isAdmin && selecionada.status === "RASCUNHO" && !selecionada.requerAvaliacaoSocio ? (
                  <GhostButton disabled={processando} onClick={() => void executarAcao("/aprovar-interna")}>
                    Aprovar internamente
                  </GhostButton>
                ) : null}
                {isSocio && selecionada.status === "PENDENTE_AVALIACAO_SOCIO" ? (
                  <>
                    <PrimaryButton disabled={processando} onClick={() => void executarAcao("/aprovar-socio")}>
                      Aprovar (sócio)
                    </PrimaryButton>
                    <GhostButton disabled={processando} onClick={() => void executarAcao("/devolver-rascunho")}>
                      Devolver para rascunho
                    </GhostButton>
                  </>
                ) : null}
                {isAdmin && selecionada.status === "APROVADA_INTERNA" ? (
                  <PrimaryButton disabled={processando} onClick={() => void executarAcao("/enviar-cliente")}>
                    Enviar ao cliente
                  </PrimaryButton>
                ) : null}
              </div>

              <ModalSection title="Documentos" titleId="prop-docs">
                {documentos.length === 0 ? (
                  <p className="proposta-panel__hint">Nenhum anexo.</p>
                ) : (
                  <ul className="proposta-panel__lista">
                    {documentos.map((d) => (
                      <li key={d.id}>
                        <span>
                          {d.nomeOriginal} (v{d.versao})
                        </span>
                        <GhostButton
                          onClick={() => void downloadDocumento(d.id, d.nomeOriginal).catch(() => setAcaoErro("Download falhou."))}
                        >
                          Baixar
                        </GhostButton>
                      </li>
                    ))}
                  </ul>
                )}
                {podeUpload ? (
                  <div className="proposta-panel__upload">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/jpeg,image/png"
                      onChange={(e) => setArquivoUpload(e.target.files?.[0] ?? null)}
                      disabled={processando}
                    />
                    <PrimaryButton
                      disabled={processando || !arquivoUpload}
                      onClick={() => void enviarDocumento()}
                    >
                      Anexar arquivo
                    </PrimaryButton>
                  </div>
                ) : null}
              </ModalSection>

              <ModalSection title="Resposta do cliente (registro interno)" titleId="prop-resposta">
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
                  <p className="proposta-panel__hint">Nenhum registro ainda.</p>
                )}
                {podeRespostaCliente ? (
                  <div className="proposta-panel__form-interacao">
                    <FormField label="Tipo" htmlFor="tipo-interacao">
                      <FieldControl
                        as="select"
                        id="tipo-interacao"
                        className="clientes-select"
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
                    <FormField label="Texto / motivo" htmlFor="texto-interacao" required>
                      <FieldControl
                        as="textarea"
                        id="texto-interacao"
                        className="clientes-input clientes-textarea"
                        value={textoInteracao}
                        onChange={(e) => setTextoInteracao(e.target.value)}
                        disabled={processando}
                        rows={4}
                      />
                    </FormField>
                    <PrimaryButton disabled={processando} onClick={() => void registrarRespostaCliente()}>
                      Registrar resposta do cliente
                    </PrimaryButton>
                  </div>
                ) : null}
              </ModalSection>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
