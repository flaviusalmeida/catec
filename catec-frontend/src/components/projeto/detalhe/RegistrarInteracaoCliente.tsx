import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { apiFetch } from "../../../api/http";
import GhostButton from "../../buttons/GhostButton";
import PrimaryButton from "../../buttons/PrimaryButton";
import FieldControl from "../../form/FieldControl";
import FormField from "../../form/FormField";
import FormDialog from "../../layout/FormDialog";
import ModalFooter from "../../layout/ModalFooter";
import { AdminFormFields } from "../../layout/entityFormKit";
import InlineAlert from "../../ui/InlineAlert";
import { mensagemErroApi } from "../../../utils/apiError";
import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_CONTRATO_ROTULO,
  TIPO_INTERACAO_ROTULO_CONTRATO,
} from "../../../pages/contratoTypes";
import type { Contrato } from "../../../pages/contratoTypes";
import type { Proposta, TipoInteracaoFluxo } from "../../../pages/propostaTypes";
import {
  ORDEM_TIPO_INTERACAO,
  STATUS_PROPOSTA_RESPOSTA_CLIENTE,
  STATUS_PROPOSTA_ROTULO,
  TIPO_INTERACAO_ROTULO_PROPOSTA,
} from "../../../pages/propostaTypes";

export type RegistrarInteracaoHandle = {
  open: () => void;
  podeRegistrar: boolean;
};

type Props = {
  projetoId: number;
  propostas: Proposta[];
  contrato: Contrato | null;
  refreshKey?: number;
  onAtualizado?: () => void;
};

function rotuloTipo(tipo: TipoInteracaoFluxo, origem: "PROPOSTA" | "CONTRATO") {
  return origem === "CONTRATO" ? TIPO_INTERACAO_ROTULO_CONTRATO[tipo] : TIPO_INTERACAO_ROTULO_PROPOSTA[tipo];
}

const RegistrarInteracaoCliente = forwardRef<RegistrarInteracaoHandle, Props>(function RegistrarInteracaoCliente(
  { projetoId, propostas, contrato, refreshKey = 0, onAtualizado },
  ref,
) {
  const [alvo, setAlvo] = useState<
    | { tipo: "PROPOSTA"; id: number; versao: number; statusLabel: string }
    | { tipo: "CONTRATO"; id: number; statusLabel: string }
    | null
  >(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoInteracao, setTipoInteracao] = useState<TipoInteracaoFluxo>("CONSIDERACOES_CLIENTE");
  const [textoInteracao, setTextoInteracao] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resolverAlvo = useCallback(() => {
    const prop =
      propostas.find((p) => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null;
    const cont =
      contrato && STATUS_CONTRATO_INTERACAO_CLIENTE.includes(contrato.status) ? contrato : null;
    if (cont) {
      return { tipo: "CONTRATO" as const, id: cont.id, statusLabel: STATUS_CONTRATO_ROTULO[cont.status] };
    }
    if (prop) {
      return {
        tipo: "PROPOSTA" as const,
        id: prop.id,
        versao: prop.versao,
        statusLabel: STATUS_PROPOSTA_ROTULO[prop.status],
      };
    }
    return null;
  }, [propostas, contrato]);

  useEffect(() => {
    setAlvo(resolverAlvo());
  }, [resolverAlvo, refreshKey]);

  const podeRegistrar = alvo != null;

  useImperativeHandle(ref, () => ({
    open: () => {
      const a = resolverAlvo();
      setAlvo(a);
      if (a) {
        setErro(null);
        setTipoInteracao(a.tipo === "CONTRATO" ? "ACEITE_CLIENTE" : "CONSIDERACOES_CLIENTE");
        setModalAberto(true);
      }
    },
    podeRegistrar,
  }));

  async function registrar() {
    if (!alvo || !textoInteracao.trim()) {
      setErro("Informe o texto da interação.");
      return;
    }
    setProcessando(true);
    setErro(null);
    try {
      const url =
        alvo.tipo === "PROPOSTA"
          ? `/api/v1/projetos/${projetoId}/propostas/${alvo.id}/interacoes`
          : `/api/v1/projetos/${projetoId}/contratos/${alvo.id}/interacoes`;
      const res = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify({ tipoInteracao, texto: textoInteracao.trim() }),
      });
      if (!res.ok) {
        setErro(await mensagemErroApi(res, "Erro ao registrar interação"));
        return;
      }
      setTextoInteracao("");
      setModalAberto(false);
      onAtualizado?.();
    } catch {
      setErro("Falha de rede ao registrar.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <FormDialog
      open={modalAberto}
      titleId="proj-modal-interacao-titulo"
      title="Registrar interação com cliente"
      panelClassName="proposta-resposta-dialog"
      onBackdropClick={() => !processando && setModalAberto(false)}
    >
      {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}
      {alvo ? (
        <p className="proj-detalhe-hint">
          Registro vinculado ao{" "}
          <strong>{alvo.tipo === "PROPOSTA" ? `proposta v${alvo.versao}` : "contrato"}</strong> ({alvo.statusLabel}).
        </p>
      ) : null}
      <AdminFormFields>
        <FormField label="Tipo" htmlFor="tipo-interacao-reg">
          <FieldControl
            as="select"
            id="tipo-interacao-reg"
            className="clientes-select"
            variant="modal"
            value={tipoInteracao}
            onChange={(e) => setTipoInteracao(e.target.value as TipoInteracaoFluxo)}
            disabled={processando || !alvo}
          >
            {alvo
              ? ORDEM_TIPO_INTERACAO.map((t) => (
                  <option key={t} value={t}>
                    {rotuloTipo(t, alvo.tipo)}
                  </option>
                ))
              : null}
          </FieldControl>
        </FormField>
        <FormField label="Texto / motivo" htmlFor="texto-interacao-reg" required>
          <FieldControl
            as="textarea"
            id="texto-interacao-reg"
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
        <GhostButton onClick={() => setModalAberto(false)} disabled={processando}>
          Cancelar
        </GhostButton>
        <PrimaryButton disabled={processando} onClick={() => void registrar()}>
          {processando ? "Registrando…" : "Registrar"}
        </PrimaryButton>
      </ModalFooter>
    </FormDialog>
  );
});

export default RegistrarInteracaoCliente;
