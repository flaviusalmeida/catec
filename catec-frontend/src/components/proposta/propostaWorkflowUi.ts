import type { PropostaStatus } from "../../pages/propostaTypes";
import { STATE_PROPOSTA_APROVADA_TITLE, STATE_PROPOSTA_REPROVADA_TITLE } from "../projeto/detalhe/stateMessages";

export type PropostaWorkflowPermissions = {
  isAdmin: boolean;
  isSocio: boolean;
};

export type PropostaWorkflowActionKey =
  | "aprovar-rascunho"
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
  if (perms.isAdmin) list.push("admin");
  if (perms.isSocio) list.push("socio");
  return list;
}

/**
 * Define action bar / state card da proposta conforme status e permissões (sem acoplar handlers).
 */
export function resolvePropostaWorkflowUi(
  status: PropostaStatus,
  opts: { hasAttachment: boolean; permissions: PropostaWorkflowPermissions },
): PropostaWorkflowUi {
  const { hasAttachment, permissions } = opts;

  if (status === "RASCUNHO" && hasAttachment && permissions.isAdmin) {
    return {
      kind: "actions",
      actions: [
        { key: "aprovar-rascunho", label: "Aprovar", variant: "primary", permission: "admin" },
        {
          key: "solicitar-revisao",
          label: "Solicitar revisão",
          variant: "secondary",
          permission: "admin",
        },
      ],
    };
  }

  /** Pendente parecer: exibe ações na UI; controle fino de quem pode executar fica para depois. */
  if (status === "PENDENTE_AVALIACAO_SOCIO") {
    return {
      kind: "actions",
      actions: [
        { key: "aprovar-socio", label: "Aprovar", variant: "primary" },
        { key: "reprovar-socio", label: "Reprovar", variant: "danger" },
      ],
    };
  }

  if (status === "APROVADA_INTERNA" && permissions.isAdmin) {
    return {
      kind: "actions",
      actions: [
        {
          key: "enviar-cliente",
          label: "Enviar ao cliente",
          variant: "primary",
          permission: "admin",
        },
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
