export type ProjetoStatus = "CRIADO" | "AGUARDANDO_ADM" | "EM_PROPOSTA";

export type Projeto = {
  id: number;
  clienteId: number;
  clienteNome: string;
  titulo: string;
  escopo: string;
  emailContato: string;
  telefoneContato: string | null;
  criadoPorId: number;
  criadoPorNome: string;
  status: ProjetoStatus;
  criadoEm: string;
  atualizadoEm: string;
};

export type ClienteResumo = {
  id: number;
  razaoSocialOuNome: string;
  email: string | null;
  telefone: string | null;
};

/** Filtros, modais e textos longos (frase completa). */
export const STATUS_PROJETO_ROTULO: Record<ProjetoStatus, string> = {
  CRIADO: "Criado",
  AGUARDANDO_ADM: "Aguardando administrativo",
  EM_PROPOSTA: "Em proposta",
};

/** Texto da pill na tabela (vira maiúsculas no CSS; manter curto por causa do `nowrap`). */
export const STATUS_PROJETO_ROTULO_BADGE: Record<ProjetoStatus, string> = {
  CRIADO: "Criado",
  AGUARDANDO_ADM: "Aguard. adm.",
  EM_PROPOSTA: "Em proposta",
};
