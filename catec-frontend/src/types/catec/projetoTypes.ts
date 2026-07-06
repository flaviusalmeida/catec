export type CatecProjetoStatus =
  | 'PENDENTE_CLIENTE'
  | 'AGUARDANDO_PROPOSTA_COMERCIAL'
  | 'ELABORANDO_PROPOSTA'
  | 'AGUARDANDO_REVISAO_PROPOSTA'
  | 'AGUARDANDO_AJUSTE'
  | 'AGUARDANDO_ENVIO_CLIENTE'
  | 'AGUARDANDO_ACEITE_PROPOSTA'
  | 'AGUARDANDO_CONTRATO'
  | 'AGUARDANDO_EXECUCAO'
  | 'EM_EXECUCAO'
  | 'CANCELADO'
  | 'FINALIZADO'

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
  clienteAssociadoEm?: string | null
  clienteAssociadoPorId?: number | null
  clienteAssociadoPorNome?: string | null
  prazoConclusaoDias: number | null
  previsaoConclusaoEm: string | null
}

export type CatecProjetoCreateInput = {
  clienteId?: number | null
  titulo: string
  escopo: string
}

export type CatecProjetoUpdateInput = {
  clienteId?: number | null
  titulo?: string
  escopo?: string
  status?: CatecProjetoStatus
}

export function parseCatecProjeto(raw: unknown): CatecProjeto {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    clienteId: data.clienteId == null ? null : Number(data.clienteId),
    clienteNome: data.clienteNome == null ? null : String(data.clienteNome),
    titulo: String(data.titulo ?? ''),
    escopo: String(data.escopo ?? ''),
    emailContato: data.emailContato == null ? null : String(data.emailContato),
    telefoneContato: data.telefoneContato == null ? null : String(data.telefoneContato),
    criadoPorId: Number(data.criadoPorId ?? 0),
    criadoPorNome: String(data.criadoPorNome ?? ''),
    status: String(data.status ?? 'PENDENTE_CLIENTE') as CatecProjetoStatus,
    criadoEm: String(data.criadoEm ?? ''),
    atualizadoEm: String(data.atualizadoEm ?? ''),
    clienteAssociadoEm: data.clienteAssociadoEm == null ? null : String(data.clienteAssociadoEm),
    clienteAssociadoPorId: data.clienteAssociadoPorId == null ? null : Number(data.clienteAssociadoPorId),
    clienteAssociadoPorNome:
      data.clienteAssociadoPorNome == null ? null : String(data.clienteAssociadoPorNome),
    prazoConclusaoDias: data.prazoConclusaoDias == null ? null : Number(data.prazoConclusaoDias),
    previsaoConclusaoEm: data.previsaoConclusaoEm == null ? null : String(data.previsaoConclusaoEm)
  }
}

export function parseCatecProjetoList(raw: unknown): CatecProjeto[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecProjeto)
}

export type CatecProjetoResumoCardStatus =
  | 'ELABORANDO_PROPOSTA'
  | 'AGUARDANDO_ACEITE_PROPOSTA'
  | 'AGUARDANDO_EXECUCAO'
  | 'EM_EXECUCAO'

export type CatecProjetoResumoCard = {
  status: CatecProjetoResumoCardStatus
  total: number
  totalHa30Dias: number
  variacaoPercentual: number
}

export type CatecProjetoResumo = {
  periodoDias: number
  cards: CatecProjetoResumoCard[]
}

export function parseCatecProjetoResumo(raw: unknown): CatecProjetoResumo {
  const data = raw as Record<string, unknown>
  const cardsRaw = Array.isArray(data.cards) ? data.cards : []

  return {
    periodoDias: Number(data.periodoDias ?? 30),
    cards: cardsRaw.map(card => {
      const item = card as Record<string, unknown>

      return {
        status: String(item.status ?? 'ELABORANDO_PROPOSTA') as CatecProjetoResumoCardStatus,
        total: Number(item.total ?? 0),
        totalHa30Dias: Number(item.totalHa30Dias ?? 0),
        variacaoPercentual: Number(item.variacaoPercentual ?? 0)
      }
    })
  }
}

export const ORDEM_STATUS_PROJETO: CatecProjetoStatus[] = [
  'PENDENTE_CLIENTE',
  'AGUARDANDO_PROPOSTA_COMERCIAL',
  'ELABORANDO_PROPOSTA',
  'AGUARDANDO_REVISAO_PROPOSTA',
  'AGUARDANDO_AJUSTE',
  'AGUARDANDO_ENVIO_CLIENTE',
  'AGUARDANDO_ACEITE_PROPOSTA',
  'AGUARDANDO_CONTRATO',
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO',
  'CANCELADO',
  'FINALIZADO'
]

export const STATUS_PROJETO_ROTULO: Record<CatecProjetoStatus, string> = {
  PENDENTE_CLIENTE: 'Pendente de cadastro de cliente',
  AGUARDANDO_PROPOSTA_COMERCIAL: 'Aguardando proposta comercial',
  ELABORANDO_PROPOSTA: 'Elaborando proposta',
  AGUARDANDO_REVISAO_PROPOSTA: 'Aguardando revisão de proposta',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste',
  AGUARDANDO_ENVIO_CLIENTE: 'Aguardando envio ao cliente',
  AGUARDANDO_ACEITE_PROPOSTA: 'Aguardando aceite da proposta',
  AGUARDANDO_CONTRATO: 'Aguardando contrato',
  AGUARDANDO_EXECUCAO: 'Aguardando execução',
  EM_EXECUCAO: 'Em execução',
  CANCELADO: 'Cancelado',
  FINALIZADO: 'Finalizado'
}

export const STATUS_PROJETO_ROTULO_BADGE: Record<CatecProjetoStatus, string> = {
  PENDENTE_CLIENTE: 'Pendente cliente',
  AGUARDANDO_PROPOSTA_COMERCIAL: 'Aguardando proposta',
  ELABORANDO_PROPOSTA: 'Elaborando proposta',
  AGUARDANDO_REVISAO_PROPOSTA: 'Aguardando revisão da proposta',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste da proposta',
  AGUARDANDO_ENVIO_CLIENTE: 'Aguardando envio da proposta',
  AGUARDANDO_ACEITE_PROPOSTA: 'Aguardando aceite da proposta',
  AGUARDANDO_CONTRATO: 'Aguardando elaboração do contrato',
  AGUARDANDO_EXECUCAO: 'Aguardando execução do contrato',
  EM_EXECUCAO: 'Em execução',
  CANCELADO: 'Cancelado',
  FINALIZADO: 'Finalizado'
}
