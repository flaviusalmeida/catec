'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ClienteListCards from './ClienteListCards'
import ClienteListTable from './ClienteListTable'
import { useClientesStore } from '../useClientesStore'

const ClienteList = () => {
  const { lista, addCliente } = useClientesStore()

  const proximoId = useMemo(() => (lista.length ? Math.max(...lista.map(c => c.id)) + 1 : 1), [lista])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Clientes</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ClienteListCards lista={lista} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ClienteListTable lista={lista} onAdd={addCliente} proximoId={proximoId} />
      </Grid>
    </Grid>
  )
}

export default ClienteList
