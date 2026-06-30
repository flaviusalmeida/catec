'use client'

import { useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { catecClientesDb } from '@/fake-db/catec/clientes'
import type { CatecProjeto } from '@/types/catec/projetoTypes'

import CustomTextField from '@core/components/mui/TextField'
import { formatTelefoneBrasil } from '@/utils/catec/brFormat'

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (projeto: CatecProjeto) => void
  proximoId: number
}

const ProjetoAddDrawer = ({ open, onClose, onAdd, proximoId }: Props) => {
  const [clienteId, setClienteId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [escopo, setEscopo] = useState('')

  const clienteSelecionado = useMemo(
    () => catecClientesDb.find(c => String(c.id) === clienteId) ?? null,
    [clienteId]
  )

  const responsavel = clienteSelecionado?.responsaveis[0] ?? null

  function reset() {
    setClienteId('')
    setTitulo('')
    setEscopo('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const tituloTrim = titulo.trim()
    const escopoTrim = escopo.trim()

    if (!tituloTrim || !escopoTrim) {
      toast.error('Preencha título e descrição.')

      return
    }

    const temCliente = Boolean(clienteSelecionado)

    if (temCliente && !responsavel?.email?.trim()) {
      toast.error('O cliente selecionado precisa ter e-mail cadastrado.')

      return
    }

    const agora = new Date().toISOString()

    onAdd({
      id: proximoId,
      clienteId: clienteSelecionado?.id ?? null,
      clienteNome: clienteSelecionado?.razaoSocialOuNome ?? null,
      titulo: tituloTrim,
      escopo: escopoTrim,
      emailContato: responsavel?.email ?? clienteSelecionado?.email ?? null,
      telefoneContato: responsavel?.telefone ?? clienteSelecionado?.telefone ?? null,
      criadoPorId: 1,
      criadoPorNome: 'Ana Silva',
      status: temCliente ? 'AGUARDANDO_PROPOSTA_COMERCIAL' : 'PENDENTE_CLIENTE',
      criadoEm: agora,
      atualizadoEm: agora
    })

    toast.success(
      temCliente
        ? 'Projeto criado com sucesso (mock).'
        : 'Demanda registrada. Associe um cliente quando possível (mock).'
    )
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 460 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Novo projeto</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit} className='flex flex-col gap-6 p-6'>
        <CustomTextField
          select
          fullWidth
          label='Cliente'
          value={clienteId}
          onChange={e => setClienteId(e.target.value)}
          slotProps={{ select: { displayEmpty: true } }}
        >
          <MenuItem value=''>Sem cliente (demanda pendente)</MenuItem>
          {catecClientesDb.map(c => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.razaoSocialOuNome}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField
          fullWidth
          label='Título'
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder='Laudo estrutural — Edifício X'
        />

        {clienteSelecionado ? (
          <div className='flex flex-col gap-2'>
            <Typography variant='subtitle2' className='font-medium'>
              Contato do cliente
            </Typography>
            {!responsavel?.email?.trim() && !clienteSelecionado.email ? (
              <Alert severity='warning' variant='outlined'>
                Este cliente não tem e-mail no cadastro. Complete o cadastro antes de salvar.
              </Alert>
            ) : (
              <>
                <Typography variant='body2'>
                  <strong>E-mail:</strong> {responsavel?.email ?? clienteSelecionado.email}
                </Typography>
                <Typography variant='body2'>
                  <strong>Telefone:</strong>{' '}
                  {responsavel?.telefone || clienteSelecionado.telefone
                    ? formatTelefoneBrasil(responsavel?.telefone ?? clienteSelecionado.telefone ?? '')
                    : '—'}
                </Typography>
              </>
            )}
          </div>
        ) : null}

        <CustomTextField
          fullWidth
          multiline
          rows={4}
          label='Descrição'
          value={escopo}
          onChange={e => setEscopo(e.target.value)}
          placeholder='Descreva o escopo da demanda'
        />

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

export default ProjetoAddDrawer
