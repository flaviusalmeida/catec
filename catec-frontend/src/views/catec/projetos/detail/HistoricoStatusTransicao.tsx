'use client'

import type { CatecContratoStatus, CatecHistoricoFluxoItem, CatecPropostaStatus } from '@/types/catec/projetoFluxoTypes'
import { STATUS_CONTRATO_ROTULO_BADGE, STATUS_PROPOSTA_ROTULO_BADGE } from '@/types/catec/projetoFluxoTypes'
import type { CatecProjetoStatus } from '@/types/catec/projetoTypes'
import { STATUS_PROJETO_ROTULO_BADGE } from '@/types/catec/projetoTypes'

import ContratoStatusBadge from '../ContratoStatusBadge'
import { historicoTemTransicaoStatus } from '../historicoFluxoHelpers'
import ProjetoStatusBadge from '../ProjetoStatusBadge'
import PropostaStatusBadge from '../PropostaStatusBadge'

type Props = {
  item: CatecHistoricoFluxoItem
}

function renderBadge(tipoEntidade: string, status: string) {
  const ent = tipoEntidade.toUpperCase()

  if (ent === 'PROJETO' && status in STATUS_PROJETO_ROTULO_BADGE) {
    return <ProjetoStatusBadge status={status as CatecProjetoStatus} />
  }

  if (ent === 'PROPOSTA' && status in STATUS_PROPOSTA_ROTULO_BADGE) {
    return <PropostaStatusBadge status={status as CatecPropostaStatus} />
  }

  if (ent === 'CONTRATO' && status in STATUS_CONTRATO_ROTULO_BADGE) {
    return <ContratoStatusBadge status={status as CatecContratoStatus} />
  }

  return null
}

const HistoricoStatusTransicao = ({ item }: Props) => {
  if (!historicoTemTransicaoStatus(item)) return null

  const hasAnterior = Boolean(item.statusAnterior)
  const hasNovo = Boolean(item.statusNovo)

  return (
    <div className='mts-2 flex flex-wrap items-center gap-2'>
      {hasAnterior && item.statusAnterior ? renderBadge(item.tipoEntidade, item.statusAnterior) : null}
      {hasAnterior && hasNovo ? (
        <i className='tabler-arrow-right text-base text-textSecondary' aria-hidden />
      ) : null}
      {hasNovo && item.statusNovo ? renderBadge(item.tipoEntidade, item.statusNovo) : null}
    </div>
  )
}

export default HistoricoStatusTransicao
