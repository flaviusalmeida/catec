'use client'

import Chip from '@mui/material/Chip'

import type { ThemeColor } from '@core/types'

import type { CatecProjetoStatus } from '@/types/catec/projetoTypes'
import { STATUS_PROJETO_ROTULO_BADGE } from '@/types/catec/projetoTypes'

const VARIANT_POR_STATUS: Record<CatecProjetoStatus, ThemeColor> = {
  PENDENTE_CLIENTE: 'warning',
  AGUARDANDO_PROPOSTA_COMERCIAL: 'info',
  ELABORANDO_PROPOSTA: 'info',
  AGUARDANDO_REVISAO_PROPOSTA: 'warning',
  AGUARDANDO_AJUSTE: 'warning',
  AGUARDANDO_ENVIO_CLIENTE: 'primary',
  AGUARDANDO_ACEITE_PROPOSTA: 'info',
  AGUARDANDO_CONTRATO: 'primary',
  AGUARDANDO_EXECUCAO: 'primary',
  EM_EXECUCAO: 'success',
  CANCELADO: 'secondary',
  FINALIZADO: 'info'
}

type Props = {
  status: CatecProjetoStatus
}

const ProjetoStatusBadge = ({ status }: Props) => {
  return (
    <Chip
      label={STATUS_PROJETO_ROTULO_BADGE[status]}
      size='small'
      variant='tonal'
      color={VARIANT_POR_STATUS[status]}
    />
  )
}

export default ProjetoStatusBadge
