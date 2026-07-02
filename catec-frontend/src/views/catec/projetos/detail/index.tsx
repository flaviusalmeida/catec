'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import type { CatecProjeto } from '@/types/catec/projetoTypes'

import { useProjetosStore } from '../useProjetosStore'
import { useProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoLeftOverview from './ProjetoLeftOverview'
import ProjetoRight from './ProjetoRight'

type Props = {
  id: string
}

const ProjetoDetalhe = ({ id }: Props) => {
  const { lista, carregando: storeCarregando, obterProjeto } = useProjetosStore()
  
  const projetoId = Number(id)
  const fluxo = useProjetoFluxoStore(projetoId)

  const [projeto, setProjeto] = useState<CatecProjeto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)

  useEffect(() => {
    if (Number.isNaN(projetoId)) {
      setNaoEncontrado(true)
      setCarregando(false)

      return
    }

    const cached = lista.find(p => p.id === projetoId)

    if (cached) {
      setProjeto(cached)
      setNaoEncontrado(false)
      setCarregando(false)

      return
    }

    if (storeCarregando) return

    let cancelled = false

    void (async () => {
      setCarregando(true)
      const remoto = await obterProjeto(projetoId)

      if (cancelled) return

      setProjeto(remoto)
      setNaoEncontrado(!remoto)
      setCarregando(false)
    })()

    return () => {
      cancelled = true
    }
  }, [projetoId, lista, storeCarregando, obterProjeto])

  useEffect(() => {
    if (!projeto) return

    const atualizado = lista.find(p => p.id === projeto.id)

    if (atualizado) setProjeto(atualizado)
  }, [lista, projeto?.id])

  if (carregando || storeCarregando || fluxo.carregando) {
    return (
      <div className='flex justify-center p-12'>
        <CircularProgress />
      </div>
    )
  }

  if (naoEncontrado || !projeto) {
    return (
      <div className='flex flex-col items-center gap-4 p-12'>
        <Typography variant='h5'>Projeto não encontrado</Typography>
        <Button
          variant='contained'
          component={Link}
          href={'/catec/projetos'}
        >
          Voltar à lista
        </Button>
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      {fluxo.erro ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' variant='outlined'>
            {fluxo.erro}
          </Alert>
        </Grid>
      ) : null}
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <ProjetoLeftOverview projeto={projeto} onStatusAlterado={fluxo.recarregar} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <ProjetoRight projeto={projeto} fluxo={fluxo} />
      </Grid>
    </Grid>
  )
}

export default ProjetoDetalhe
