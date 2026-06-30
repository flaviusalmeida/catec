'use client'

import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { catecPermissoesCatalogo } from '@/fake-db/catec/permissoes'
import type { CatecGrupo } from '@/types/catec/grupoTypes'
import { grupoToForm, type CatecGrupoFormState } from '@/types/catec/grupoTypes'

import CustomTextField from '@core/components/mui/TextField'

import GrupoPermissoesPanel from './GrupoPermissoesPanel'

type Props = {
  grupo: CatecGrupo
  onSave: (permissoes: string[]) => void
}

const GrupoPermissoesTab = ({ grupo, onSave }: Props) => {
  const [form, setForm] = useState<CatecGrupoFormState>(() => grupoToForm(grupo))
  const [filtro, setFiltro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const totalCatalogo = catecPermissoesCatalogo.length

  useEffect(() => {
    setForm(grupoToForm(grupo))
  }, [grupo])

  function togglePermissao(codigo: string) {
    setForm(f => {
      const next = new Set(f.permissoes)

      if (next.has(codigo)) next.delete(codigo)
      else next.add(codigo)

      return { ...f, permissoes: next }
    })
  }

  function toggleModulo(codigos: string[], marcar: boolean) {
    setForm(f => {
      const next = new Set(f.permissoes)

      for (const codigo of codigos) {
        if (marcar) next.add(codigo)
        else next.delete(codigo)
      }

      return { ...f, permissoes: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (form.permissoes.size === 0) {
      toast.error('Selecione pelo menos uma permissão.')

      return
    }

    setSalvando(true)
    await new Promise(r => setTimeout(r, 400))
    onSave([...form.permissoes])
    setSalvando(false)
    toast.success('Permissões atualizadas (mock).')
  }

  return (
    <form onSubmit={e => void handleSubmit(e)} className='flex flex-col gap-4'>
      <Card>
        <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CustomTextField
            fullWidth
            label='Buscar permissão'
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder='Nome, código ou módulo'
            className='max-is-full sm:max-is-[320px]'
          />
          <Typography color='text.secondary'>
            {form.permissoes.size} de {totalCatalogo} permissões selecionadas
          </Typography>
        </CardContent>
      </Card>

      <GrupoPermissoesPanel
        catalogo={catecPermissoesCatalogo}
        form={form}
        filtro={filtro}
        disabled={salvando}
        onToggle={togglePermissao}
        onToggleModulo={toggleModulo}
      />

      <div>
        <Button variant='contained' type='submit' disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}

export default GrupoPermissoesTab
