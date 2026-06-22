import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import { PermissaoCodigo } from "../../auth/permissao";
import GhostButton from "../buttons/GhostButton";
import PrimaryButton from "../buttons/PrimaryButton";
import FieldControl from "../form/FieldControl";
import FormField from "../form/FormField";
import FormDialog from "../layout/FormDialog";
import ModalFooter from "../layout/ModalFooter";
import { AdminFormFields, AdminFormSection } from "../layout/entityFormKit";
import InlineAlert from "../ui/InlineAlert";
import { mensagemErroApi } from "../../utils/apiError";
import type { Contrato } from "../../pages/contratoTypes";
import {
  STATUS_CONTRATO_ENVIADO,
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_CONTRATO_ROTULO,
  TIPO_INTERACAO_ROTULO_CONTRATO,
} from "../../pages/contratoTypes";
import type { InteracaoFluxo, Proposta, TipoInteracaoFluxo } from "../../pages/propostaTypes";
import {
  ORDEM_TIPO_INTERACAO,
  STATUS_PROPOSTA_ENVIADA,
  STATUS_PROPOSTA_RESPOSTA_CLIENTE,
  STATUS_PROPOSTA_ROTULO,
  TIPO_INTERACAO_ROTULO_PROPOSTA,
} from "../../pages/propostaTypes";
import "../proposta/PropostaPanel.css";

type Props = {
  projetoId: number;
  refreshKey?: number;
  onAtualizado?: () => void;
};

type OrigemInteracao = "PROPOSTA" | "CONTRATO";

type InteracaoItem = {
  key: string;
  id: number;
  tipoInteracao: TipoInteracaoFluxo;
  texto: string;
  registradoPorNome: string;
  criadoEm: string;
  contextoLabel: string;
  origem: OrigemInteracao;
};

function rotuloTipoInteracao(tipo: TipoInteracaoFluxo, origem: OrigemInteracao): string {
  return origem === "CONTRATO"
    ? TIPO_INTERACAO_ROTULO_CONTRATO[tipo]
    : TIPO_INTERACAO_ROTULO_PROPOSTA[tipo];
}

function tipoInteracaoPadrao(origem: OrigemInteracao): TipoInteracaoFluxo {
  return origem === "CONTRATO" ? "ACEITE_CLIENTE" : "CONSIDERACOES_CLIENTE";
}

type AlvoRegistro =
  | { tipo: "PROPOSTA"; id: number; versao: number; statusLabel: string }
  | { tipo: "CONTRATO"; id: number; statusLabel: string };

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export default function InteracoesClientePanel({ projetoId, refreshKey = 0, onAtualizado }: Props) {
  const { hasPermission, logout } = useAuth();
  const [interacoes, setInteracoes] = useState<InteracaoItem[]>([]);
  const [alvoRegistro, setAlvoRegistro] = useState<AlvoRegistro | null>(null);
  const [temFluxoCliente, setTemFluxoCliente] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [acaoErro, setAcaoErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [tipoInteracao, setTipoInteracao] = useState<TipoInteracaoFluxo>("CONSIDERACOES_CLIENTE");
  const [textoInteracao, setTextoInteracao] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setAcaoErro(null);
    try {
      const [resProp, resCont] = await Promise.all([
        apiFetch(`/api/v1/projetos/${projetoId}/propostas`),
        apiFetch(`/api/v1/projetos/${projetoId}/contratos`),
      ]);
      if (resProp.status === 401) {
        logout();
        return;
      }

      const propostas: Proposta[] = resProp.ok ? ((await resProp.json()) as Proposta[]) : [];
      const contratos: Contrato[] = resCont.ok ? ((await resCont.json()) as Contrato[]) : [];
      const contrato = contratos[0] ?? null;

      const propostaResposta =
        propostas.find((p) => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null;
      const contratoResposta =
        contrato != null && STATUS_CONTRATO_INTERACAO_CLIENTE.includes(contrato.status) ? contrato : null;

      if (contratoResposta) {
        setAlvoRegistro({
          tipo: "CONTRATO",
          id: contratoResposta.id,
          statusLabel: STATUS_CONTRATO_ROTULO[contratoResposta.status],
        });
      } else if (propostaResposta) {
        setAlvoRegistro({
          tipo: "PROPOSTA",
          id: propostaResposta.id,
          versao: propostaResposta.versao,
          statusLabel: STATUS_PROPOSTA_ROTULO[propostaResposta.status],
        });
      } else {
        setAlvoRegistro(null);
      }

      const detalhesProp = await Promise.all(
        propostas.map(async (p) => {
          const res = await apiFetch(`/api/v1/projetos/${projetoId}/propostas/${p.id}/interacoes`);
          const ints: InteracaoFluxo[] = res.ok ? ((await res.json()) as InteracaoFluxo[]) : [];
          return ints.map((i) => ({
            key: `P-${i.id}`,
            id: i.id,
            tipoInteracao: i.tipoInteracao,
            texto: i.texto,
            registradoPorNome: i.registradoPorNome,
            criadoEm: i.criadoEm,
            contextoLabel: `proposta v${p.versao}`,
            origem: "PROPOSTA" as const,
          }));
        }),
      );

      let itensContrato: InteracaoItem[] = [];
      if (contrato) {
        const resInt = await apiFetch(
          `/api/v1/projetos/${projetoId}/contratos/${contrato.id}/interacoes`,
        );
        const ints: InteracaoFluxo[] = resInt.ok ? ((await resInt.json()) as InteracaoFluxo[]) : [];
        itensContrato = ints.map((i) => ({
          key: `C-${i.id}`,
          id: i.id,
          tipoInteracao: i.tipoInteracao,
          texto: i.texto,
          registradoPorNome: i.registradoPorNome,
          criadoEm: i.criadoEm,
          contextoLabel: "contrato",
          origem: "CONTRATO" as const,
        }));
      }

      const unificado = [...detalhesProp.flat(), ...itensContrato].sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
      );
      setInteracoes(unificado);
      setTemFluxoCliente(
        unificado.length > 0 ||
          contratoResposta != null ||
          propostaResposta != null ||
          propostas.some((p) => STATUS_PROPOSTA_ENVIADA.includes(p.status)) ||
          (contrato != null && STATUS_CONTRATO_ENVIADO.includes(contrato.status)),
      );
    } catch {
      setAcaoErro("Falha ao carregar interações com o cliente.");
      setInteracoes([]);
      setAlvoRegistro(null);
      setTemFluxoCliente(false);
    } finally {
      setCarregando(false);
    }
  }, [projetoId, logout]);

  useEffect(() => {
    void carregar();
  }, [carregar, refreshKey]);

  const podeRegistrar =
    hasPermission(PermissaoCodigo.ACAO_INTERACAO_REGISTRAR) && alvoRegistro != null;
  const deveExibir = carregando || temFluxoCliente;

  async function registrarInteracao() {
    if (!alvoRegistro || !textoInteracao.trim()) {
      setAcaoErro("Informe o texto da interação.");
      return;
    }
    setProcessando(true);
    setAcaoErro(null);
    try {
      const url =
        alvoRegistro.tipo === "PROPOSTA"
          ? `/api/v1/projetos/${projetoId}/propostas/${alvoRegistro.id}/interacoes`
          : `/api/v1/projetos/${projetoId}/contratos/${alvoRegistro.id}/interacoes`;
      const res = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify({ tipoInteracao, texto: textoInteracao.trim() }),
      });
      if (!res.ok) {
        setAcaoErro(await mensagemErroApi(res, "Erro ao registrar interação"));
        return;
      }
      setTextoInteracao("");
      setTipoInteracao(tipoInteracaoPadrao(alvoRegistro.tipo));
      setModalAberto(false);
      await carregar();
      onAtualizado?.();
    } catch {
      setAcaoErro("Falha de rede ao registrar.");
    } finally {
      setProcessando(false);
    }
  }

  function fecharModal() {
    if (processando) return;
    setModalAberto(false);
    setTextoInteracao("");
    setTipoInteracao(alvoRegistro ? tipoInteracaoPadrao(alvoRegistro.tipo) : "CONSIDERACOES_CLIENTE");
  }

  if (!deveExibir) {
    return null;
  }

  const acoesRegistrar = podeRegistrar ? (
    <PrimaryButton
      variant="toolbar"
      onClick={() => {
        setAcaoErro(null);
        setTipoInteracao(tipoInteracaoPadrao(alvoRegistro.tipo));
        setModalAberto(true);
      }}
      disabled={processando}
    >
      Registrar
    </PrimaryButton>
  ) : undefined;

  return (
    <>
      <AdminFormSection
        title="Interações com cliente"
        titleId="proj-sec-interacoes-cliente"
        actions={acoesRegistrar}
      >
        {acaoErro && !modalAberto ? <InlineAlert variant="error">{acaoErro}</InlineAlert> : null}

        {carregando ? (
          <p className="admin-entity-form-loading" role="status">
            Carregando interações…
          </p>
        ) : interacoes.length > 0 ? (
          <ul className="proposta-panel__interacoes">
            {interacoes.map((i) => (
              <li key={i.key}>
                <strong>
                  {rotuloTipoInteracao(i.tipoInteracao, i.origem)}
                  <span className="proposta-panel__interacao-versao"> · {i.contextoLabel}</span>
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
            Nenhuma interação com o cliente registrada ainda.
          </p>
        )}
      </AdminFormSection>

      <FormDialog
        open={modalAberto}
        titleId="proj-modal-interacao-titulo"
        title="Registrar interação com cliente"
        panelClassName="proposta-resposta-dialog"
        onBackdropClick={fecharModal}
      >
        {acaoErro && modalAberto ? <InlineAlert variant="error">{acaoErro}</InlineAlert> : null}
        {alvoRegistro ? (
          <p className="proposta-panel__hint">
            Registro vinculado ao{" "}
            <strong>
              {alvoRegistro.tipo === "PROPOSTA"
                ? `proposta v${alvoRegistro.versao}`
                : "contrato"}
            </strong>{" "}
            ({alvoRegistro.statusLabel}).
          </p>
        ) : null}
        <AdminFormFields>
          <FormField label="Tipo" htmlFor="tipo-interacao-proj-modal">
            <FieldControl
              as="select"
              id="tipo-interacao-proj-modal"
              className="clientes-select"
              variant="modal"
              value={tipoInteracao}
              onChange={(e) => setTipoInteracao(e.target.value as TipoInteracaoFluxo)}
              disabled={processando}
            >
              {alvoRegistro
                ? ORDEM_TIPO_INTERACAO.map((t) => (
                    <option key={t} value={t}>
                      {rotuloTipoInteracao(t, alvoRegistro.tipo)}
                    </option>
                  ))
                : null}
            </FieldControl>
          </FormField>
          <FormField label="Texto / motivo" htmlFor="texto-interacao-proj-modal" required>
            <FieldControl
              as="textarea"
              id="texto-interacao-proj-modal"
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
          <GhostButton onClick={fecharModal} disabled={processando}>
            Cancelar
          </GhostButton>
          <PrimaryButton disabled={processando} onClick={() => void registrarInteracao()}>
            {processando ? "Registrando…" : "Registrar"}
          </PrimaryButton>
        </ModalFooter>
      </FormDialog>
    </>
  );
}
