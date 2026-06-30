'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'

import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

import type { CatecGrupo } from '@/types/catec/grupoTypes'

type Props = {
  lista: CatecGrupo[]
}

const GrupoListCards = ({ lista }: Props) => {
  const data = useMemo<UserDataType[]>(() => {
    const sistema = lista.filter(g => g.sistema).length
    const custom = lista.filter(g => !g.sistema).length
    const ativos = lista.filter(g => g.ativo).length

    return [
      {
        title: 'Total',
        stats: String(lista.length),
        avatarIcon: 'tabler-users-group',
        avatarColor: 'primary',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Grupos cadastrados'
      },
      {
        title: 'Sistema',
        stats: String(sistema),
        avatarIcon: 'tabler-shield-lock',
        avatarColor: 'info',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Grupos protegidos'
      },
      {
        title: 'Customizados',
        stats: String(custom),
        avatarIcon: 'tabler-adjustments',
        avatarColor: 'warning',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Grupos editáveis'
      },
      {
        title: 'Ativos',
        stats: String(ativos),
        avatarIcon: 'tabler-user-check',
        avatarColor: 'success',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Grupos em uso'
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

export default GrupoListCards
