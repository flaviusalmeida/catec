export type ProjetoStatus =
  | "PENDENTE_CLIENTE"
  | "AGUARDANDO_PROPOSTA_COMERCIAL"
  | "ELABORANDO_PROPOSTA"
  | "AGUARDANDO_ACEITE_PROPOSTA"
  | "AGUARDANDO_CONTRATO"
  | "EM_EXECUCAO"
  | "CANCELADO";

export type Projeto = {
  id: number;
  clienteId: number | null;
  clienteNome: string | null;
  titulo: string;
  escopo: string;
  emailContato: string | null;
  telefoneContato: string | null;
  criadoPorId: number;
  criadoPorNome: string;
  status: ProjetoStatus;
  criadoEm: string;
  atualizadoEm: string;
  clienteAssociadoEm: string | null;
  clienteAssociadoPorId: number | null;
  clienteAssociadoPorNome: string | null;
};

export type ClienteResumo = {
  id: number;
  razaoSocialOuNome: string;
  email: string | null;
  telefone: string | null;
};

/** Ordem do pipeline (filtros, selects). */
export const ORDEM_STATUS_PROJETO: ProjetoStatus[] = [
  "PENDENTE_CLIENTE",
  "AGUARDANDO_PROPOSTA_COMERCIAL",
  "ELABORANDO_PROPOSTA",
  "AGUARDANDO_ACEITE_PROPOSTA",
  "AGUARDANDO_CONTRATO",
  "EM_EXECUCAO",
  "CANCELADO",
];

/** Filtros, modais e textos longos (frase completa). */
export const STATUS_PROJETO_ROTULO: Record<ProjetoStatus, string> = {
  PENDENTE_CLIENTE: "Pendente de cadastro de cliente",
  AGUARDANDO_PROPOSTA_COMERCIAL: "Aguardando proposta comercial",
  ELABORANDO_PROPOSTA: "Elaborando proposta",
  AGUARDANDO_ACEITE_PROPOSTA: "Aguardando aceite da proposta",
  AGUARDANDO_CONTRATO: "Aguardando contrato",
  EM_EXECUCAO: "Em execução",
  CANCELADO: "Cancelado",
};

/** Texto da pill na tabela (vira maiúsculas no CSS; manter curto por causa do `nowrap`). */
export const STATUS_PROJETO_ROTULO_BADGE: Record<ProjetoStatus, string> = {
  PENDENTE_CLIENTE: "Pend. cliente",
  AGUARDANDO_PROPOSTA_COMERCIAL: "Aguard. prop.",
  ELABORANDO_PROPOSTA: "Elaborando",
  AGUARDANDO_ACEITE_PROPOSTA: "Aguard. aceite",
  AGUARDANDO_CONTRATO: "Aguard. contrato",
  EM_EXECUCAO: "Em execução",
  CANCELADO: "Cancelado",
};
