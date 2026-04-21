export type ProjetoStatus =
  | "PENDENTE_CLIENTE"
  | "AGUARDANDO_PROPOSTA_COMERCIAL"
  | "ELABORANDO_PROPOSTA"
  | "PROPOSTA_CONCLUIDA";

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
  "PROPOSTA_CONCLUIDA",
];

/**
 * Destinos permitidos a partir de cada status (administrativo).
 * Alinhado a {@code ProjetoService#validarTransicao} no backend.
 */
export const PROJETO_TRANSICOES_ADMIN: Record<ProjetoStatus, readonly ProjetoStatus[]> = {
  PENDENTE_CLIENTE: [],
  AGUARDANDO_PROPOSTA_COMERCIAL: ["ELABORANDO_PROPOSTA"],
  ELABORANDO_PROPOSTA: ["PROPOSTA_CONCLUIDA"],
  PROPOSTA_CONCLUIDA: [],
};

/** Status atual + destinos válidos para o select do administrativo (ordem do fluxo). */
export function statusOpcoesFluxoAdmin(atual: ProjetoStatus): ProjetoStatus[] {
  if (atual === "PENDENTE_CLIENTE") {
    return ["PENDENTE_CLIENTE"];
  }
  const destinos = PROJETO_TRANSICOES_ADMIN[atual];
  const conjunto = new Set<ProjetoStatus>([atual, ...destinos]);
  return ORDEM_STATUS_PROJETO.filter((s) => conjunto.has(s));
}

/** Filtros, modais e textos longos (frase completa). */
export const STATUS_PROJETO_ROTULO: Record<ProjetoStatus, string> = {
  PENDENTE_CLIENTE: "Pendente de cadastro de cliente",
  AGUARDANDO_PROPOSTA_COMERCIAL: "Aguardando proposta comercial",
  ELABORANDO_PROPOSTA: "Elaborando proposta",
  PROPOSTA_CONCLUIDA: "Proposta concluída",
};

/** Texto da pill na tabela (vira maiúsculas no CSS; manter curto por causa do `nowrap`). */
export const STATUS_PROJETO_ROTULO_BADGE: Record<ProjetoStatus, string> = {
  PENDENTE_CLIENTE: "Pend. cliente",
  AGUARDANDO_PROPOSTA_COMERCIAL: "Aguard. prop.",
  ELABORANDO_PROPOSTA: "Elaborando",
  PROPOSTA_CONCLUIDA: "Prop. concl.",
};
