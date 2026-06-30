'use client'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'

import { useGruposStore } from '../useGruposStore'
import GrupoLeftOverview from './GrupoLeftOverview'
import GrupoRight from './GrupoRight'

type Props = {
  id: string
}

const GrupoView = ({ id }: Props) => {
  const { lista, updateGrupo, removeGrupo } = useGruposStore()
  const { lang: locale } = useParams()
  const router = useRouter()

  const grupo = lista.find(g => g.id === Number(id))

  if (!grupo) {
    return (
      <div className='flex flex-col items-center gap-4 p-12'>
        <Typography variant='h5'>Grupo não encontrado</Typography>
        <Button
          variant='contained'
          component={Link}
          href={getLocalizedUrl('/catec/grupos', locale as Locale)}
        >
          Voltar à lista
        </Button>
      </div>
    )
  }

  function handleExcluir() {
    removeGrupo(grupo.id)
    toast.success('Grupo excluído (mock).')
    router.push(getLocalizedUrl('/catec/grupos', locale as Locale))
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <GrupoLeftOverview grupo={grupo} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <GrupoRight
          grupo={grupo}
          onUpdate={patch => updateGrupo(grupo.id, patch)}
          onExcluir={handleExcluir}
        />
      </Grid>
    </Grid>
  )
}

export default GrupoView
