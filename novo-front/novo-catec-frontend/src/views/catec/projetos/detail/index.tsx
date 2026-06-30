'use client'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'

import { useProjetosStore } from '../useProjetosStore'
import { useProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoLeftOverview from './ProjetoLeftOverview'
import ProjetoRight from './ProjetoRight'

type Props = {
  id: string
}

const ProjetoDetalhe = ({ id }: Props) => {
  const { lista, hydrated: projetosHydrated } = useProjetosStore()
  const { lang: locale } = useParams()
  const projetoId = Number(id)
  const fluxo = useProjetoFluxoStore(projetoId)

  const projeto = lista.find(p => p.id === projetoId)

  if (!projetosHydrated || !fluxo.hydrated) {
    return (
      <Typography color='text.secondary' className='p-12 text-center'>
        Carregando…
      </Typography>
    )
  }

  if (!projeto) {
    return (
      <div className='flex flex-col items-center gap-4 p-12'>
        <Typography variant='h5'>Projeto não encontrado</Typography>
        <Button
          variant='contained'
          component={Link}
          href={getLocalizedUrl('/catec/projetos', locale as Locale)}
        >
          Voltar à lista
        </Button>
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <ProjetoLeftOverview projeto={projeto} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <ProjetoRight projeto={projeto} fluxo={fluxo} />
      </Grid>
    </Grid>
  )
}

export default ProjetoDetalhe
