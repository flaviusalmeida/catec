import type {
  CatecHistoricoFluxoItem,
  CatecProjetoFluxoData,
  CatecProjetoFluxoResumo,
  CatecProposta,
  CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'
import {
  TIPO_INTERACAO_ROTULO_CONTRATO,
  TIPO_INTERACAO_ROTULO_PROPOSTA
} from '@/types/catec/projetoFluxoTypes'

export function formatarDataCurta(iso: string | null): string {
  if (!iso) return '—'

  return new Date(iso).toLocaleDateString('pt-BR')
}

export function formatarDataHora(iso: string | null): string {
  if (!iso) return '—'

  return new Date(iso).toLocaleString('pt-BR')
}

function rotuloTipoInteracao(tipo: CatecTipoInteracaoFluxo, entidade: string): string {
  const ent = entidade.toUpperCase()

  if (ent === 'CONTRATO') return TIPO_INTERACAO_ROTULO_CONTRATO[tipo]

  return TIPO_INTERACAO_ROTULO_PROPOSTA[tipo]
}

export function rotuloHistoricoItem(item: CatecHistoricoFluxoItem): string {
  if (item.origem === 'INTERACAO' && item.tipoInteracao) {
    return rotuloTipoInteracao(item.tipoInteracao, item.tipoEntidade)
  }

  if (item.acao) {
    return item.acao.replaceAll('_', ' ')
  }

  return item.origem === 'AUDITORIA' ? 'Auditoria' : 'Interação'
}

export function metaHistoricoItem(item: CatecHistoricoFluxoItem): string {
  const partes = [item.usuarioNome, formatarDataHora(item.ocorridoEm)]

  if (item.statusAnterior && item.statusNovo) {
    partes.push(`${item.statusAnterior} → ${item.statusNovo}`)
  } else if (item.tipoEntidade) {
    partes.push(item.tipoEntidade.toLowerCase())
  }

  return partes.join(' · ')
}

const STATUS_PROJETO_EDITAR_CONTRATO = [
  'AGUARDANDO_CONTRATO',
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO'
] as const

export function projetoPermiteEditarContrato(status: string): boolean {
  return STATUS_PROJETO_EDITAR_CONTRATO.includes(status as (typeof STATUS_PROJETO_EDITAR_CONTRATO)[number])
}

/** @deprecated use projetoPermiteEditarContrato */
export function projetoPermiteContrato(status: string): boolean {
  return projetoPermiteEditarContrato(status)
}

export function projetoPermiteVisualizarContrato(status: string, temContrato: boolean): boolean {
  return temContrato || projetoPermiteEditarContrato(status)
}

export function propostaMaisRecente(propostas: CatecProposta[]): CatecProposta | null {
  if (propostas.length === 0) return null

  return [...propostas].sort((a, b) => b.versao - a.versao)[0]
}

export function computeProjetoFluxoResumo(projetoId: number, data: CatecProjetoFluxoData): CatecProjetoFluxoResumo {
  const propostaAtual = propostaMaisRecente(data.propostas)
  const ultimaInteracao = data.interacoes[0]?.criadoEm ?? null

  return {
    projetoId,
    propostaStatus: propostaAtual?.status ?? null,
    contratoStatus: data.contrato?.status ?? null,
    ultimaInteracaoEm: ultimaInteracao
  }
}

export function resolvePropostaWorkflowActions(
  status: string,
  opts: {
    hasAttachment: boolean
    avaliadaSocioEm: string | null
    podeAprovarSocio?: boolean
    podeDevolverSocio?: boolean
  }
): Array<{ key: string; label: string; color: 'primary' | 'secondary' | 'error' }> {
  const { hasAttachment, avaliadaSocioEm, podeAprovarSocio = false, podeDevolverSocio = false } = opts

  if (status === 'RASCUNHO' && hasAttachment) {
    if (!avaliadaSocioEm) {
      return [{ key: 'solicitar-revisao', label: 'Enviar para revisão do sócio', color: 'secondary' }]
    }

    return [{ key: 'enviar-cliente', label: 'Enviar ao cliente', color: 'primary' }]
  }

  if (status === 'PENDENTE_AVALIACAO') {
    const actions: Array<{ key: string; label: string; color: 'primary' | 'secondary' | 'error' }> = []

    if (podeAprovarSocio) {
      actions.push({ key: 'aprovar-socio', label: 'Aprovar', color: 'primary' })
    }

    if (podeDevolverSocio) {
      actions.push({ key: 'reprovar-socio', label: 'Reprovar', color: 'error' })
    }

    return actions
  }

  return []
}
