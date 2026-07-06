'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import type { CatecProjetoStatus } from '@/types/catec/projetoTypes'

import PainelAlertaCards from './PainelAlertaCards'
import PainelKpiCards from './PainelKpiCards'
import PainelPrazoProximo from './PainelPrazoProximo'
import PainelProjetosTable from './PainelProjetosTable'
import PainelStatusDonut from './PainelStatusDonut'
import { usePainelStore } from './usePainelStore'

const PainelView = () => {
  const { painel, carregando, erro } = usePainelStore()
  const [statusFiltro, setStatusFiltro] = useState<CatecProjetoStatus | null>(null)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Dashboard</Typography>
      </Grid>

      {erro ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' variant='outlined'>
            {erro}
          </Alert>
        </Grid>
      ) : null}

      {carregando || !painel ? (
        <Grid size={{ xs: 12 }} className='flex justify-center p-12'>
          <CircularProgress />
        </Grid>
      ) : (
        <>
          <Grid size={{ xs: 12 }}>
            <PainelAlertaCards painel={painel} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <PainelKpiCards
              painel={painel}
              statusSelecionado={statusFiltro}
              onStatusClick={setStatusFiltro}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <PainelStatusDonut
              painel={painel}
              statusSelecionado={statusFiltro}
              onStatusClick={setStatusFiltro}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <PainelPrazoProximo projetos={painel.projetosPrazoProximo} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <PainelProjetosTable
              projetos={painel.projetos}
              statusFiltro={statusFiltro}
              onStatusFiltroChange={setStatusFiltro}
            />
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default PainelView
