export type CatecPropostaStatus =
  | 'RASCUNHO'
  | 'PENDENTE_AVALIACAO'
  | 'ENVIADA_AO_CLIENTE'
  | 'EM_AVALIACAO_CLIENTE'
  | 'AGUARDANDO_AJUSTE'
  | 'ACEITA'
  | 'NEGADA'

export type CatecContratoStatus =
  | 'RASCUNHO'
  | 'ENVIADO_AO_CLIENTE'
  | 'AGUARDANDO_AJUSTE'
  | 'ACEITO'
  | 'RECUSADO'

export type CatecTipoInteracaoFluxo = 'CONSIDERACOES_CLIENTE' | 'ACEITE_CLIENTE' | 'RECUSA_CLIENTE'

export const STATUS_PROPOSTA_ROTULO: Record<CatecPropostaStatus, string> = {
  RASCUNHO: 'Rascunho',
  PENDENTE_AVALIACAO: 'Pendente avaliação',
  ENVIADA_AO_CLIENTE: 'Enviada ao cliente',
  EM_AVALIACAO_CLIENTE: 'Em avaliação do cliente',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste',
  ACEITA: 'Aceita pelo cliente',
  NEGADA: 'Negada pelo cliente'
}

export const STATUS_CONTRATO_ROTULO: Record<CatecContratoStatus, string> = {
  RASCUNHO: 'Em elaboração',
  ENVIADO_AO_CLIENTE: 'Enviado ao cliente',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste',
  ACEITO: 'Aceito pelo cliente',
  RECUSADO: 'Recusado pelo cliente'
}

export const TIPO_INTERACAO_ROTULO_PROPOSTA: Record<CatecTipoInteracaoFluxo, string> = {
  ACEITE_CLIENTE: 'Proposta aceita',
  RECUSA_CLIENTE: 'Proposta recusada',
  CONSIDERACOES_CLIENTE: 'Ajustar proposta'
}

export const TIPO_INTERACAO_ROTULO_CONTRATO: Record<CatecTipoInteracaoFluxo, string> = {
  ACEITE_CLIENTE: 'Contrato aceito',
  RECUSA_CLIENTE: 'Contrato recusado',
  CONSIDERACOES_CLIENTE: 'Ajustar contrato'
}

export const STATUS_PROPOSTA_UPLOAD: CatecPropostaStatus[] = ['RASCUNHO', 'AGUARDANDO_AJUSTE']
export const STATUS_PROPOSTA_ENVIADA: CatecPropostaStatus[] = [
  'ENVIADA_AO_CLIENTE',
  'EM_AVALIACAO_CLIENTE',
  'AGUARDANDO_AJUSTE',
  'ACEITA',
  'NEGADA'
]
export const STATUS_PROPOSTA_RESPOSTA_CLIENTE: CatecPropostaStatus[] = [
  'ENVIADA_AO_CLIENTE',
  'EM_AVALIACAO_CLIENTE',
  'AGUARDANDO_AJUSTE'
]

export const STATUS_CONTRATO_UPLOAD: CatecContratoStatus[] = ['RASCUNHO', 'AGUARDANDO_AJUSTE']
export const STATUS_CONTRATO_INTERACAO_CLIENTE: CatecContratoStatus[] = [
  'ENVIADO_AO_CLIENTE',
  'AGUARDANDO_AJUSTE'
]

export type CatecDocumentoAnexo = {
  id: number
  nomeOriginal: string
  versao: number
  uploadedPorNome: string
  criadoEm: string
}

export type CatecProposta = {
  id: number
  projetoId: number
  status: CatecPropostaStatus
  versao: number
  requerAvaliacaoSocio: boolean
  elaboradoPorId: number
  elaboradoPorNome: string
  enviadaClienteEm: string | null
  avaliadaSocioEm: string | null
  consideracoesPendentes: boolean
  criadoEm: string
  atualizadoEm: string
  documentos: CatecDocumentoAnexo[]
}

export type CatecContrato = {
  id: number
  projetoId: number
  status: CatecContratoStatus
  elaboradoPorId: number
  elaboradoPorNome: string
  enviadoClienteEm: string | null
  criadoEm: string
  atualizadoEm: string
  documentos: CatecDocumentoAnexo[]
}

export type CatecInteracaoTimelineItem = {
  key: string
  titulo: string
  meta: string
  texto: string
  criadoEm: string
  origem: 'PROPOSTA' | 'CONTRATO'
}

export type CatecHistoricoFluxoItem = {
  origem: 'AUDITORIA' | 'INTERACAO'
  registroId: number
  tipoEntidade: string
  entidadeId: number
  acao: string | null
  statusAnterior: string | null
  statusNovo: string | null
  tipoInteracao: CatecTipoInteracaoFluxo | null
  texto: string | null
  usuarioNome: string
  ocorridoEm: string
}

export type CatecProjetoFluxoResumo = {
  projetoId: number
  propostaStatus: CatecPropostaStatus | null
  contratoStatus: CatecContratoStatus | null
  ultimaInteracaoEm: string | null
}

export type CatecProjetoFluxoData = {
  propostas: CatecProposta[]
  contrato: CatecContrato | null
  interacoes: CatecInteracaoTimelineItem[]
  historico: CatecHistoricoFluxoItem[]
}

export type CatecPropostaWorkflowActionKey =
  | 'solicitar-revisao'
  | 'aprovar-socio'
  | 'reprovar-socio'
  | 'enviar-cliente'
