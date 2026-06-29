'use client'

import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecAdminUsuario, CatecGrupoValor } from '@/types/catec/usuarioTypes'
import { GRUPOS_OPCOES } from '@/types/catec/usuarioTypes'

type Props = {
  usuario: CatecAdminUsuario
  onSave: (grupos: CatecGrupoValor[]) => void
}

const Usuario2GruposTab = ({ usuario, onSave }: Props) => {
  const [grupos, setGrupos] = useState<Set<CatecGrupoValor>>(new Set(usuario.grupos))
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setGrupos(new Set(usuario.grupos))
  }, [usuario.grupos])

  function toggleGrupo(valor: CatecGrupoValor) {
    setGrupos(prev => {
      const next = new Set(prev)

      if (next.has(valor)) next.delete(valor)
      else next.add(valor)

      return next
    })
  }

  async function handleSave() {
    if (grupos.size === 0) {
      toast.error('Selecione pelo menos um grupo.')

      return
    }

    setSalvando(true)
    await new Promise(r => setTimeout(r, 400))
    onSave([...grupos])
    setSalvando(false)
    toast.success('Grupos atualizados (mock).')
  }

  return (
    <Card>
      <CardHeader title='Grupos de acesso' />
      <CardContent className='flex flex-col gap-4'>
        <Grid container spacing={2}>
          {GRUPOS_OPCOES.map(g => (
            <Grid size={{ xs: 12, sm: 6 }} key={g.valor}>
              <FormControlLabel
                control={
                  <Checkbox checked={grupos.has(g.valor)} onChange={() => toggleGrupo(g.valor)} />
                }
                label={
                  <span>
                    <Typography component='span' className='font-medium'>
                      {g.rotulo}
                    </Typography>
                    <Typography component='span' variant='body2' color='text.secondary' className='block'>
                      {g.detalhe}
                    </Typography>
                  </span>
                }
              />
            </Grid>
          ))}
        </Grid>
        <Button variant='contained' onClick={() => void handleSave()} disabled={salvando}>
          {salvando ? 'A guardar…' : 'Guardar grupos'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default Usuario2GruposTab
