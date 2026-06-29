import type { PropostaStatus } from "../../pages/propostaTypes";
import { STATE_PROPOSTA_APROVADA_TITLE, STATE_PROPOSTA_REPROVADA_TITLE } from "../projeto/detalhe/stateMessages";

export type PropostaWorkflowPermissions = {
  podeEnviarCliente: boolean;
  podeSubmeterSocio: boolean;
  podeSocio: boolean;
};

export type PropostaWorkflowActionKey =
  | "solicitar-revisao"
  | "aprovar-socio"
  | "reprovar-socio"
  | "enviar-cliente";

export type PropostaWorkflowActionDef = {
  key: PropostaWorkflowActionKey;
  label: string;
  variant: "primary" | "secondary" | "danger";
  permission?: "admin" | "socio";
};

export type PropostaWorkflowStateCardDef = {
  title: string;
  description?: string;
};

export type PropostaWorkflowUi =
  | { kind: "none" }
  | { kind: "state"; state: PropostaWorkflowStateCardDef }
  | { kind: "actions"; actions: PropostaWorkflowActionDef[] };

export function propostaWorkflowPermissions(perms: PropostaWorkflowPermissions): string[] {
  const list: string[] = [];
  if (perms.podeEnviarCliente || perms.podeSubmeterSocio) list.push("admin");
  if (perms.podeSocio) list.push("socio");
  return list;
}

function podeEnviarAoCliente(
  requerAvaliacaoSocio: boolean,
  avaliadaSocioEm: string | null,
): boolean {
  return !requerAvaliacaoSocio || avaliadaSocioEm != null;
}

/**
 * Define action bar / state card da proposta conforme status e permissões (sem acoplar handlers).
 */
export function resolvePropostaWorkflowUi(
  status: PropostaStatus,
  opts: {
    hasAttachment: boolean;
    requerAvaliacaoSocio: boolean;
    avaliadaSocioEm: string | null;
    permissions: PropostaWorkflowPermissions;
  },
): PropostaWorkflowUi {
  const { hasAttachment, requerAvaliacaoSocio, avaliadaSocioEm, permissions } = opts;

  if (status === "RASCUNHO" && hasAttachment && permissions.podeEnviarCliente) {
    const actions: PropostaWorkflowActionDef[] = [];

    if (podeEnviarAoCliente(requerAvaliacaoSocio, avaliadaSocioEm)) {
      actions.push({
        key: "enviar-cliente",
        label: "Enviar ao cliente",
        variant: "primary",
        permission: "admin",
      });
    }

    if (
      permissions.podeSubmeterSocio &&
      requerAvaliacaoSocio &&
      avaliadaSocioEm == null
    ) {
      actions.push({
        key: "solicitar-revisao",
        label: "Solicitar revisão",
        variant: actions.length > 0 ? "secondary" : "primary",
        permission: "admin",
      });
    }

    if (actions.length > 0) {
      return { kind: "actions", actions };
    }
  }

  if (status === "PENDENTE_AVALIACAO" && permissions.podeSocio) {
    return {
      kind: "actions",
      actions: [
        { key: "aprovar-socio", label: "Aprovar", variant: "primary", permission: "socio" },
        { key: "reprovar-socio", label: "Reprovar", variant: "danger", permission: "socio" },
      ],
    };
  }

  if (status === "ACEITA") {
    return { kind: "state", state: { title: STATE_PROPOSTA_APROVADA_TITLE } };
  }

  if (status === "NEGADA") {
    return { kind: "state", state: { title: STATE_PROPOSTA_REPROVADA_TITLE } };
  }

  return { kind: "none" };
}
