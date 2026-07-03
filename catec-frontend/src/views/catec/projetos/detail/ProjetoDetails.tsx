'use client'

import Link from 'next/link'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import type { CatecProjeto } from '@/types/catec/projetoTypes'
import { STATUS_PROJETO_ROTULO } from '@/types/catec/projetoTypes'

import CustomAvatar from '@core/components/mui/Avatar'
import { formatTelefoneBrasil } from '@/utils/catec/brFormat'
import { getInitials } from '@/utils/getInitials'

import ProjetoStatusBadge from '../ProjetoStatusBadge'
import ProjetoEncerrarStatus from './ProjetoEncerrarStatus'

type Props = {
  projeto: CatecProjeto
  onStatusAlterado?: () => Promise<void>
}

const ProjetoDetails = ({ projeto, onStatusAlterado }: Props) => {
  

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col items-center gap-4'>
              <CustomAvatar variant='rounded' size={120}>
                {getInitials(projeto.titulo)}
              </CustomAvatar>
              <Typography variant='h5' className='text-center'>
                {projeto.titulo}
              </Typography>
            </div>
            <ProjetoStatusBadge status={projeto.status} />
            <ProjetoEncerrarStatus projeto={projeto} onStatusAlterado={onStatusAlterado} />
          </div>

          <div>
            <Typography variant='h5'>Detalhes</Typography>
          <Divider className='mlb-4' />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Cliente:
              </Typography>
              {projeto.clienteId && projeto.clienteNome ? (
                <Typography
                  component={Link}
                  href={`/catec/clientes/view/${projeto.clienteId}`}
                  color='primary.main'
                >
                  {projeto.clienteNome}
                </Typography>
              ) : (
                <Typography>—</Typography>
              )}
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Criado por:
              </Typography>
              <Typography>{projeto.criadoPorNome}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Status:
              </Typography>
              <Typography>{STATUS_PROJETO_ROTULO[projeto.status]}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                E-mail:
              </Typography>
              <Typography>{projeto.emailContato ?? '—'}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Telefone:
              </Typography>
              <Typography>
                {projeto.telefoneContato ? formatTelefoneBrasil(projeto.telefoneContato) : '—'}
              </Typography>
            </div>
            </div>
          </div>

          <div className='flex gap-4 justify-center'>
          <Button
            variant='tonal'
            color='secondary'
            component={Link}
            href={'/catec/projetos'}
            startIcon={<i className='tabler-arrow-left' />}
          >
            Voltar à lista
          </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjetoDetails
