'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'

import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

import type { CatecProjeto } from '@/types/catec/projetoTypes'

type Props = {
  lista: CatecProjeto[]
}

const ProjetoListCards = ({ lista }: Props) => {
  const data = useMemo<UserDataType[]>(() => {
    const emRevisaoProposta = lista.filter(p => p.status === 'ELABORANDO_PROPOSTA').length
    const aguardandoCliente = lista.filter(p => p.status === 'AGUARDANDO_ACEITE_PROPOSTA').length
    const aguardandoExecucao = lista.filter(p => p.status === 'AGUARDANDO_EXECUCAO').length
    const emExecucao = lista.filter(p => p.status === 'EM_EXECUCAO').length

    return [
      {
        title: 'Rev. proposta',
        stats: String(emRevisaoProposta),
        avatarIcon: 'tabler-file-pencil',
        avatarColor: 'info',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Em revisão da proposta'
      },
      {
        title: 'Aguard. cliente',
        stats: String(aguardandoCliente),
        avatarIcon: 'tabler-user-check',
        avatarColor: 'warning',
        trend: 'negative',
        trendNumber: '—',
        subtitle: 'Aceite da proposta'
      },
      {
        title: 'Aguard. execução',
        stats: String(aguardandoExecucao),
        avatarIcon: 'tabler-hourglass',
        avatarColor: 'primary',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Aguardando execução'
      },
      {
        title: 'Em execução',
        stats: String(emExecucao),
        avatarIcon: 'tabler-player-play',
        avatarColor: 'success',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Projetos ativos'
      }
    ]
  }, [lista])

  return (
    <Grid container spacing={6}>
      {data.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default ProjetoListCards
