'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ProjetoListCards from './ProjetoListCards'
import ProjetoListTable from './ProjetoListTable'
import { useProjetosStore } from '../useProjetosStore'

const ProjetoList = () => {
  const { lista, addProjeto } = useProjetosStore()

  const proximoId = useMemo(() => (lista.length ? Math.max(...lista.map(p => p.id)) + 1 : 1), [lista])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Projetos</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ProjetoListCards lista={lista} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ProjetoListTable lista={lista} onAdd={addProjeto} proximoId={proximoId} />
      </Grid>
    </Grid>
  )
}

export default ProjetoList
