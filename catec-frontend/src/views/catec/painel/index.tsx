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

  return (
    <div
      ref={ref}
      className={telaCheia ? 'bg-[var(--mui-palette-background-default)] min-bs-screen overflow-y-auto p-6' : undefined}
    >
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-between gap-4'>
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
    </div>
  )
}

export default PainelView
