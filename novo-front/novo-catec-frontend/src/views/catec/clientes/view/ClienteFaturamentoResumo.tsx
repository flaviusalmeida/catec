'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import type { CatecCliente } from '@/types/catec/clienteTypes'

import { formatTelefoneBrasil } from '@/utils/catec/brFormat'

type Props = {
  cliente: CatecCliente
}

const ClienteFaturamentoResumo = ({ cliente }: Props) => {
  const responsavel = cliente.responsaveis[0]

  return (
    <Card className='border-2 border-primary rounded shadow-primarySm'>
      <CardContent className='flex flex-col gap-4'>
        <Typography variant='h6'>Faturamento e contato</Typography>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <i className='tabler-circle-filled text-[10px] text-primary' />
            <Typography component='span'>
              Período: <strong>{cliente.periodoFaturamento || 'Não informado'}</strong>
            </Typography>
          </div>
          {responsavel ? (
            <>
              <div className='flex items-center gap-2'>
                <i className='tabler-circle-filled text-[10px] text-primary' />
                <Typography component='span'>{responsavel.nome}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-circle-filled text-[10px] text-primary' />
                <Typography component='span'>{responsavel.email}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-circle-filled text-[10px] text-primary' />
                <Typography component='span'>{formatTelefoneBrasil(responsavel.telefone)}</Typography>
              </div>
            </>
          ) : (
            <Typography color='text.secondary'>Responsável não cadastrado.</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ClienteFaturamentoResumo
