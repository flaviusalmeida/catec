'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import Usuario2ListCards from './Usuario2ListCards'
import Usuario2ListTable from './Usuario2ListTable'
import { useUsuarios2Store } from '../useUsuarios2Store'

const Usuario2List = () => {
  const { lista, addUsuario } = useUsuarios2Store()

  const proximoId = useMemo(() => (lista.length ? Math.max(...lista.map(u => u.id)) + 1 : 1), [lista])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Usuários</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Usuario2ListCards lista={lista} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Usuario2ListTable lista={lista} onAdd={addUsuario} proximoId={proximoId} />
      </Grid>
    </Grid>
  )
}

export default Usuario2List
