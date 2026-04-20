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

export const STATUS_PROJETO_ROTULO: Record<ProjetoStatus, string> = {
  CRIADO: "Criado",
  AGUARDANDO_ADM: "Aguardando administrativo",
  EM_PROPOSTA: "Em proposta",
};
