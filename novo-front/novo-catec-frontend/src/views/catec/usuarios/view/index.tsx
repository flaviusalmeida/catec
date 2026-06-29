'use client'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'

import { useUsuarios2Store } from '../useUsuarios2Store'
import Usuario2LeftOverview from './Usuario2LeftOverview'
import Usuario2Right from './Usuario2Right'

type Props = {
  id: string
}

const Usuario2View = ({ id }: Props) => {
  const { lista, updateUsuario } = useUsuarios2Store()
  const { lang: locale } = useParams()

  const usuario = lista.find(u => u.id === Number(id))

  if (!usuario) {
    return (
      <div className='flex flex-col items-center gap-4 p-12'>
        <Typography variant='h5'>Usuário não encontrado</Typography>
        <Button
          variant='contained'
          component={Link}
          href={getLocalizedUrl('/catec/usuarios', locale as Locale)}
        >
          Voltar à lista
        </Button>
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <Usuario2LeftOverview usuario={usuario} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <Usuario2Right usuario={usuario} onUpdate={patch => updateUsuario(usuario.id, patch)} />
      </Grid>
    </Grid>
  )
}

export default Usuario2View
