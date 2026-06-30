import type { CatecHistoricoFluxoItem, CatecTipoInteracaoFluxo } from '@/types/catec/projetoFluxoTypes'
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

export function projetoPermiteContrato(status: string): boolean {
  return status === 'AGUARDANDO_CONTRATO' || status === 'AGUARDANDO_EXECUCAO' || status === 'EM_EXECUCAO'
}

export function resolvePropostaWorkflowActions(
  status: string,
  opts: {
    hasAttachment: boolean
    requerAvaliacaoSocio: boolean
    avaliadaSocioEm: string | null
  }
): Array<{ key: string; label: string; color: 'primary' | 'secondary' | 'error' }> {
  const { hasAttachment, requerAvaliacaoSocio, avaliadaSocioEm } = opts

  if (status === 'RASCUNHO' && hasAttachment) {
    const actions: Array<{ key: string; label: string; color: 'primary' | 'secondary' | 'error' }> = []

    if (!requerAvaliacaoSocio || avaliadaSocioEm) {
      actions.push({ key: 'enviar-cliente', label: 'Enviar ao cliente', color: 'primary' })
    }

    if (requerAvaliacaoSocio && !avaliadaSocioEm) {
      actions.push({ key: 'solicitar-revisao', label: 'Solicitar revisão', color: 'secondary' })
    }

    return actions
  }

  if (status === 'PENDENTE_AVALIACAO') {
    return [
      { key: 'aprovar-socio', label: 'Aprovar', color: 'primary' },
      { key: 'reprovar-socio', label: 'Reprovar', color: 'error' }
    ]
  }

  return []
}
