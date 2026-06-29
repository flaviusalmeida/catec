'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecCliente, TipoPessoa } from '@/types/catec/clienteTypes'

import CustomTextField from '@core/components/mui/TextField'
import { formatDocumentoByTipo, onlyDigits } from '@/utils/catec/brFormat'

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (cliente: CatecCliente) => void
  proximoId: number
}

const ClienteAddDrawer = ({ open, onClose, onAdd, proximoId }: Props) => {
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('PF')
  const [razaoSocialOuNome, setRazaoSocialOuNome] = useState('')
  const [documento, setDocumento] = useState('')
  const [email, setEmail] = useState('')

  function reset() {
    setTipoPessoa('PF')
    setRazaoSocialOuNome('')
    setDocumento('')
    setEmail('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!razaoSocialOuNome.trim() || !email.trim() || !onlyDigits(documento)) {
      toast.error('Informe nome, documento e e-mail.')

      return
    }

    onAdd({
      id: proximoId,
      tipoPessoa,
      razaoSocialOuNome: razaoSocialOuNome.trim(),
      nomeFantasia: null,
      documento: onlyDigits(documento),
      email: email.trim(),
      telefone: null,
      enderecoLogradouro: null,
      enderecoNumero: null,
      enderecoComplemento: null,
      enderecoCidade: null,
      enderecoUf: null,
      enderecoCep: null,
      periodoFaturamento: '',
      observacoes: null,
      responsaveis: []
    })

    toast.success('Cliente criado (mock). Complete os dados na página de detalhe.')
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
        <Typography variant='h5'>Novo cliente</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit} className='flex flex-col gap-6 p-6'>
        <CustomTextField
          select
          fullWidth
          label='Tipo de pessoa'
          value={tipoPessoa}
          onChange={e => {
            const tipo = e.target.value as TipoPessoa
            const d = onlyDigits(documento).slice(0, tipo === 'PF' ? 11 : 14)

            setTipoPessoa(tipo)
            setDocumento(d ? formatDocumentoByTipo(tipo, d) : '')
          }}
        >
          <MenuItem value='PF'>Pessoa Física</MenuItem>
          <MenuItem value='PJ'>Pessoa Jurídica</MenuItem>
        </CustomTextField>
        <CustomTextField
          fullWidth
          label='CPF/CNPJ'
          value={documento}
          onChange={e => {
            const max = tipoPessoa === 'PF' ? 11 : 14
            const d = onlyDigits(e.target.value).slice(0, max)

            setDocumento(d ? formatDocumentoByTipo(tipoPessoa, d) : '')
          }}
          placeholder={tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
        />
        <CustomTextField
          fullWidth
          label='Nome / Razão social'
          value={razaoSocialOuNome}
          onChange={e => setRazaoSocialOuNome(e.target.value)}
        />
        <CustomTextField
          fullWidth
          type='email'
          label='E-mail'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Typography variant='body2' color='text.secondary'>
          Endereço, faturamento e responsável podem ser preenchidos na página de detalhe.
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

export default ClienteAddDrawer
