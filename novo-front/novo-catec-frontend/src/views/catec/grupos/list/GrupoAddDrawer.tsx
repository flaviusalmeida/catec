'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecGrupo } from '@/types/catec/grupoTypes'
import { slugCodigoGrupo } from '@/types/catec/grupoTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (grupo: CatecGrupo) => void
  proximoId: number
  codigosExistentes: string[]
}

const GrupoAddDrawer = ({ open, onClose, onAdd, proximoId, codigosExistentes }: Props) => {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [ativo, setAtivo] = useState(true)

  function reset() {
    setNome('')
    setDescricao('')
    setAtivo(true)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome.trim()) {
      toast.error('Informe o nome do grupo.')

      return
    }

    let codigo = slugCodigoGrupo(nome)

    if (!codigo) {
      toast.error('Nome inválido para gerar código.')

      return
    }

    if (codigosExistentes.includes(codigo)) {
      codigo = `${codigo}_${proximoId}`
    }

    const agora = new Date().toISOString()

    onAdd({
      id: proximoId,
      codigo,
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      ativo,
      sistema: false,
      permissoes: [],
      criadoEm: agora,
      atualizadoEm: agora
    })

    toast.success('Grupo criado (mock). Configure permissões na edição.')
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Novo grupo</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit} className='flex flex-col gap-6 p-6'>
        <CustomTextField
          fullWidth
          label='Nome'
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder='Comercial externo'
        />
        <CustomTextField
          fullWidth
          multiline
          rows={3}
          label='Descrição'
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />
        <FormControlLabel
          control={<Switch checked={ativo} onChange={e => setAtivo(e.target.checked)} />}
          label='Grupo ativo'
        />
        <Typography variant='body2' color='text.secondary'>
          O código é gerado automaticamente a partir do nome. Permissões podem ser configuradas após a criação.
        </Typography>
        <div className='flex items-center gap-4'>
          <Button variant='contained' type='submit'>
            Criar
          </Button>
          <Button variant='tonal' color='secondary' type='button' onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default GrupoAddDrawer
