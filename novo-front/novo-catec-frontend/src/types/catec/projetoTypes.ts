export type CatecProjetoStatus =
  | 'PENDENTE_CLIENTE'
  | 'AGUARDANDO_PROPOSTA_COMERCIAL'
  | 'ELABORANDO_PROPOSTA'
  | 'AGUARDANDO_ACEITE_PROPOSTA'
  | 'AGUARDANDO_CONTRATO'
  | 'AGUARDANDO_EXECUCAO'
  | 'EM_EXECUCAO'
  | 'CANCELADO'

export type CatecProjeto = {
  id: number
  clienteId: number | null
  clienteNome: string | null
  titulo: string
  escopo: string
  emailContato: string | null
  telefoneContato: string | null
  criadoPorId: number
  criadoPorNome: string
  status: CatecProjetoStatus
  criadoEm: string
  atualizadoEm: string
}

export const ORDEM_STATUS_PROJETO: CatecProjetoStatus[] = [
  'PENDENTE_CLIENTE',
  'AGUARDANDO_PROPOSTA_COMERCIAL',
  'ELABORANDO_PROPOSTA',
  'AGUARDANDO_ACEITE_PROPOSTA',
  'AGUARDANDO_CONTRATO',
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO',
  'CANCELADO'
]

export const STATUS_PROJETO_ROTULO: Record<CatecProjetoStatus, string> = {
  PENDENTE_CLIENTE: 'Pendente de cadastro de cliente',
  AGUARDANDO_PROPOSTA_COMERCIAL: 'Aguardando proposta comercial',
  ELABORANDO_PROPOSTA: 'Elaborando proposta',
  AGUARDANDO_ACEITE_PROPOSTA: 'Aguardando aceite da proposta',
  AGUARDANDO_CONTRATO: 'Aguardando contrato',
  AGUARDANDO_EXECUCAO: 'Aguardando execução',
  EM_EXECUCAO: 'Em execução',
  CANCELADO: 'Cancelado'
}

export const STATUS_PROJETO_ROTULO_BADGE: Record<CatecProjetoStatus, string> = {
  PENDENTE_CLIENTE: 'Pend. cliente',
  AGUARDANDO_PROPOSTA_COMERCIAL: 'Aguard. prop.',
  ELABORANDO_PROPOSTA: 'Elaborando',
  AGUARDANDO_ACEITE_PROPOSTA: 'Aguard. aceite',
  AGUARDANDO_CONTRATO: 'Aguard. contrato',
  AGUARDANDO_EXECUCAO: 'Aguard. execução',
  EM_EXECUCAO: 'Em execução',
  CANCELADO: 'Cancelado'
}
