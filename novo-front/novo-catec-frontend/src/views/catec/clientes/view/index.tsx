'use client'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'

import { useClientesStore } from '../useClientesStore'
import ClienteLeftOverview from './ClienteLeftOverview'
import ClienteRight from './ClienteRight'

type Props = {
  id: string
}

const ClienteView = ({ id }: Props) => {
  const { lista, updateCliente } = useClientesStore()
  const { lang: locale } = useParams()

  const cliente = lista.find(c => c.id === Number(id))

  if (!cliente) {
    return (
      <div className='flex flex-col items-center gap-4 p-12'>
        <Typography variant='h5'>Cliente não encontrado</Typography>
        <Button
          variant='contained'
          component={Link}
          href={getLocalizedUrl('/catec/clientes', locale as Locale)}
        >
          Voltar à lista
        </Button>
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <ClienteLeftOverview cliente={cliente} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <ClienteRight cliente={cliente} onUpdate={patch => updateCliente(cliente.id, patch)} />
      </Grid>
    </Grid>
  )
}

export default ClienteView
