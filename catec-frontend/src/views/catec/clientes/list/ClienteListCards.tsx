'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'

import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

import type { CatecCliente } from '@/types/catec/clienteTypes'

type Props = {
  lista: CatecCliente[]
}

const ClienteListCards = ({ lista }: Props) => {
  const data = useMemo<UserDataType[]>(() => {
    const pf = lista.filter(c => c.tipoPessoa === 'PF').length
    const pj = lista.filter(c => c.tipoPessoa === 'PJ').length
    const comResponsavel = lista.filter(c => c.responsaveis.length > 0).length

    return [
      {
        title: 'Total',
        stats: String(lista.length),
        avatarIcon: 'tabler-building',
        avatarColor: 'primary',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Clientes cadastrados'
      },
      {
        title: 'Pessoa Física',
        stats: String(pf),
        avatarIcon: 'tabler-user',
        avatarColor: 'info',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Clientes PF'
      },
      {
        title: 'Pessoa Jurídica',
        stats: String(pj),
        avatarIcon: 'tabler-building-skyscraper',
        avatarColor: 'success',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Clientes PJ'
      },
      {
        title: 'Com responsável',
        stats: String(comResponsavel),
        avatarIcon: 'tabler-user-check',
        avatarColor: 'warning',
        trend: 'positive',
        trendNumber: '—',
        subtitle: 'Contato principal definido'
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

export default ClienteListCards
