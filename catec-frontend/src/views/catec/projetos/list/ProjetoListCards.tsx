'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'

import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

import type { CatecProjeto, CatecProjetoResumo, CatecProjetoResumoCardStatus } from '@/types/catec/projetoTypes'

import { formatVariacaoPercentual, trendFromVariacao } from './projetoResumoHelpers'

type Props = {
  lista: CatecProjeto[]
  resumo: CatecProjetoResumo | null
}

type CardDef = {
  status: CatecProjetoResumoCardStatus
  title: string
  avatarIcon: string
  avatarColor: UserDataType['avatarColor']
  subtitle: string
}

const CARD_DEFS: CardDef[] = [
  {
    status: 'ELABORANDO_PROPOSTA',
    title: 'Rev. proposta',
    avatarIcon: 'tabler-file-pencil',
    avatarColor: 'info',
    subtitle: 'Em revisão da proposta'
  },
  {
    status: 'AGUARDANDO_ACEITE_PROPOSTA',
    title: 'Aguard. cliente',
    avatarIcon: 'tabler-user-check',
    avatarColor: 'warning',
    subtitle: 'Aceite da proposta'
  },
  {
    status: 'AGUARDANDO_EXECUCAO',
    title: 'Aguard. execução',
    avatarIcon: 'tabler-hourglass',
    avatarColor: 'primary',
    subtitle: 'Aguardando execução'
  },
  {
    status: 'EM_EXECUCAO',
    title: 'Em execução',
    avatarIcon: 'tabler-player-play',
    avatarColor: 'success',
    subtitle: 'Projetos ativos'
  }
]

const ProjetoListCards = ({ lista, resumo }: Props) => {
  const data = useMemo<UserDataType[]>(() => {
    const periodo = resumo?.periodoDias ?? 30

    return CARD_DEFS.map(def => {
      const cardResumo = resumo?.cards.find(c => c.status === def.status)
      const totalFallback = lista.filter(p => p.status === def.status).length
      const total = cardResumo?.total ?? totalFallback
      const variacao = cardResumo?.variacaoPercentual

      return {
        title: def.title,
        stats: String(total),
        avatarIcon: def.avatarIcon,
        avatarColor: def.avatarColor,
        trend: variacao == null ? 'positive' : trendFromVariacao(variacao),
        trendNumber: variacao == null ? '—' : formatVariacaoPercentual(variacao),
        subtitle: `${def.subtitle} • vs. há ${periodo} dias`
      }
    })
  }, [lista, resumo])

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
