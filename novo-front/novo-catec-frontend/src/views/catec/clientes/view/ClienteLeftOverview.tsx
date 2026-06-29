'use client'

import Grid from '@mui/material/Grid'

import type { CatecCliente } from '@/types/catec/clienteTypes'

import ClienteDetails from './ClienteDetails'
import ClienteFaturamentoResumo from './ClienteFaturamentoResumo'

type Props = {
  cliente: CatecCliente
}

const ClienteLeftOverview = ({ cliente }: Props) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ClienteDetails cliente={cliente} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ClienteFaturamentoResumo cliente={cliente} />
      </Grid>
    </Grid>
  )
}

export default ClienteLeftOverview
