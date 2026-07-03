'use client'

import Chip from '@mui/material/Chip'

import type { ThemeColor } from '@core/types'

import type { CatecPropostaStatus } from '@/types/catec/projetoFluxoTypes'
import { STATUS_PROPOSTA_ROTULO_BADGE } from '@/types/catec/projetoFluxoTypes'

const VARIANT_POR_STATUS: Record<CatecPropostaStatus, ThemeColor> = {
  RASCUNHO: 'secondary',
  PENDENTE_AVALIACAO: 'warning',
  ENVIADA_AO_CLIENTE: 'info',
  AGUARDANDO_AJUSTE: 'warning',
  ACEITA: 'success',
  NEGADA: 'error'
}

type Props = {
  status: CatecPropostaStatus
}

const PropostaStatusBadge = ({ status }: Props) => {
  return (
    <Chip
      label={STATUS_PROPOSTA_ROTULO_BADGE[status]}
      size='small'
      variant='tonal'
      color={VARIANT_POR_STATUS[status]}
    />
  )
}

export default PropostaStatusBadge
