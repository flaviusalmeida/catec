'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import GrupoListCards from './GrupoListCards'
import GrupoListTable from './GrupoListTable'
import { useGruposStore } from '../useGruposStore'

const GrupoList = () => {
  const { lista, addGrupo } = useGruposStore()

  const proximoId = useMemo(() => (lista.length ? Math.max(...lista.map(g => g.id)) + 1 : 1), [lista])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Grupos de acesso</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GrupoListCards lista={lista} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GrupoListTable lista={lista} onAdd={addGrupo} proximoId={proximoId} />
      </Grid>
    </Grid>
  )
}

export default GrupoList
