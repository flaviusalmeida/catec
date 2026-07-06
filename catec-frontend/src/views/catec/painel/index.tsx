'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import type { CatecProjetoStatus } from '@/types/catec/projetoTypes'

import PainelAlertaCards from './PainelAlertaCards'
import PainelKpiCards from './PainelKpiCards'
import PainelPrazoProximo from './PainelPrazoProximo'
import PainelProjetosTable from './PainelProjetosTable'
import PainelStatusDonut from './PainelStatusDonut'
import { useFullscreen } from './useFullscreen'
import { usePainelStore } from './usePainelStore'

const PainelView = () => {
  const { painel, carregando, erro } = usePainelStore()
  const [statusFiltro, setStatusFiltro] = useState<CatecProjetoStatus | null>(null)
  const { ref, ativo: telaCheia, alternar: alternarTelaCheia } = useFullscreen<HTMLDivElement>()

  const gridSpacing = telaCheia ? 4 : 6

  const conteudo =
    carregando || !painel ? (
      <div className='flex flex-1 items-center justify-center'>
        <CircularProgress />
      </div>
    ) : (
      <Grid
        container
        spacing={gridSpacing}
        className={telaCheia ? 'min-h-0 flex-1 content-start' : undefined}
        sx={telaCheia ? { display: 'flex', flex: '1 1 auto', minHeight: 0 } : undefined}
      >
        <Grid size={{ xs: 12 }}>
          <PainelAlertaCards painel={painel} compact={telaCheia} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <PainelKpiCards
            painel={painel}
            statusSelecionado={statusFiltro}
            onStatusClick={setStatusFiltro}
            compact={telaCheia}
          />
        </Grid>
        <Grid
          size={{ xs: 12 }}
          sx={telaCheia ? { display: 'flex', flex: '1 1 auto', minHeight: 0, width: '100%' } : undefined}
        >
          <Grid container spacing={gridSpacing} className={telaCheia ? 'min-h-0 w-full flex-1' : 'is-full'}>
            <Grid size={{ xs: 12, md: 5, lg: 4 }} className={telaCheia ? 'flex min-h-0' : undefined}>
              <PainelStatusDonut
                painel={painel}
                statusSelecionado={statusFiltro}
                onStatusClick={setStatusFiltro}
                compact={telaCheia}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 7, lg: 8 }} className={telaCheia ? 'flex min-h-0' : undefined}>
              <PainelPrazoProximo projetos={painel.projetosPrazoProximo} compact={telaCheia} />
            </Grid>
          </Grid>
        </Grid>
        {!telaCheia ? (
          <Grid size={{ xs: 12 }}>
            <PainelProjetosTable
              projetos={painel.projetos}
              statusFiltro={statusFiltro}
              onStatusFiltroChange={setStatusFiltro}
            />
          </Grid>
        ) : null}
      </Grid>
    )

  return (
    <div
      ref={ref}
      className={
        telaCheia
          ? 'flex h-dvh w-full flex-col overflow-hidden bg-[var(--mui-palette-background-default)] p-5'
          : undefined
      }
    >
      <div className='flex shrink-0 items-center justify-between gap-4'>
        <Typography variant='h4'>Dashboard</Typography>
        <Tooltip title={telaCheia ? 'Sair da tela cheia (Esc)' : 'Tela cheia'}>
          <IconButton
            aria-label={telaCheia ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
            onClick={() => void alternarTelaCheia()}
            color='primary'
          >
            <i className={telaCheia ? 'tabler-arrows-minimize' : 'tabler-arrows-maximize'} />
          </IconButton>
        </Tooltip>
      </div>

      {erro ? (
        <Alert severity='error' variant='outlined' className='mt-4 shrink-0'>
          {erro}
        </Alert>
      ) : null}

      <div className={telaCheia ? 'mt-4 flex min-h-0 flex-1 flex-col' : 'mt-6'}>{conteudo}</div>
    </div>
  )
}

export default PainelView
