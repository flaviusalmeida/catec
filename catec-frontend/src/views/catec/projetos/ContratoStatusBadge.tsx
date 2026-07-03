'use client'

import Chip from '@mui/material/Chip'

import type { ThemeColor } from '@core/types'

import type { CatecContratoStatus } from '@/types/catec/projetoFluxoTypes'
import { STATUS_CONTRATO_ROTULO_BADGE } from '@/types/catec/projetoFluxoTypes'

const VARIANT_POR_STATUS: Record<CatecContratoStatus, ThemeColor> = {
  RASCUNHO: 'info',
  ENVIADO_AO_CLIENTE: 'primary',
  AGUARDANDO_AJUSTE: 'warning',
  ACEITO: 'success',
  RECUSADO: 'error'
}

type Props = {
  status: CatecContratoStatus
}

const ContratoStatusBadge = ({ status }: Props) => {
  return (
    <Chip
      label={STATUS_CONTRATO_ROTULO_BADGE[status]}
      size='small'
      variant='tonal'
      color={VARIANT_POR_STATUS[status]}
    />
  )
}

export default ContratoStatusBadge
