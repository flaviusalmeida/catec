'use client'

import Link from 'next/link'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'

import ProjetoStatusBadge from '@/views/catec/projetos/ProjetoStatusBadge'
import type { CatecProjetoPainelItem } from '@/types/catec/projetoTypes'
import { formatarDataCurta } from '@/views/catec/projetos/projetoFluxoHelpers'

import { corProgressoPrazo, formatarDiasRestantes } from './painelPrazoUtils'

type Props = {
  projetos: CatecProjetoPainelItem[]
}

const PainelPrazoProximo = ({ projetos }: Props) => {
  return (
    <Card className='bs-full'>
      <CardHeader
        title='Projetos vencidos ou com prazo próximo'
        subheader='Ordenados pela previsão de conclusão'
      />
      <CardContent className='flex flex-col gap-4'>
        {projetos.length === 0 ? (
          <Typography color='text.secondary' className='text-center p-4'>
            Nenhum projeto com previsão de conclusão definida.
          </Typography>
        ) : (
          projetos.map(item => (
            <div key={item.id} className='flex items-center gap-4'>
              <CustomAvatar skin='light' color={corProgressoPrazo(item)} variant='rounded' size={34}>
                <i className='tabler-calendar-event' />
              </CustomAvatar>
                <div className='flex flex-col gap-1 min-is-0 is-full'>
                  <Link
                    href={`/catec/projetos/${item.id}`}
                    className='font-medium text-textPrimary hover:text-primary no-underline line-clamp-1'
                  >
                    {item.titulo}
                  </Link>
                  <Typography variant='body2' color='text.secondary' className='line-clamp-1'>
                    {item.clienteNome ?? 'Sem cliente'} · {formatarDataCurta(item.previsaoConclusaoEm!)}
                  </Typography>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <ProjetoStatusBadge status={item.status} />
                    <Typography variant='caption' color='text.secondary'>
                      {formatarDiasRestantes(item.diasRestantes)}
                    </Typography>
                  </div>
                </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default PainelPrazoProximo
