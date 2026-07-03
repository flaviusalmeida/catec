'use client'

import type { CatecPropostaStatus } from '@/types/catec/projetoFluxoTypes'
import { STATUS_PROPOSTA_ROTULO_BADGE } from '@/types/catec/projetoFluxoTypes'
import { semanticaPropostaStatus } from '@/utils/catec/fluxoStatusBadge'

import FluxoStatusChip from './FluxoStatusChip'

type Props = {
  status: CatecPropostaStatus
  avaliadaSocioEm?: string | null
}

const PropostaStatusBadge = ({ status, avaliadaSocioEm }: Props) => {
  const aguardandoEnvio = status === 'RASCUNHO' && avaliadaSocioEm != null

  return (
    <FluxoStatusChip
      label={aguardandoEnvio ? 'Aguardando envio' : STATUS_PROPOSTA_ROTULO_BADGE[status]}
      semantica={aguardandoEnvio ? 'aguardandoAcao' : semanticaPropostaStatus(status)}
    />
  )
}

export default PropostaStatusBadge
