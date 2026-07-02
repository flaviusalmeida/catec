'use client'

import { useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'

import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_CONTRATO_ROTULO,
  STATUS_PROPOSTA_RESPOSTA_CLIENTE,
  STATUS_PROPOSTA_ROTULO,
  TIPO_INTERACAO_ROTULO_CONTRATO,
  TIPO_INTERACAO_ROTULO_PROPOSTA,
  type CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'

import CustomTextField from '@core/components/mui/TextField'

import type { CatecProjeto } from '@/types/catec/projetoTypes'

import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoEncerrarStatus from './ProjetoEncerrarStatus'
import ProjetoStateCard from './ProjetoStateCard'
import ProjetoTimeline from './ProjetoTimeline'

type Props = {
  projeto: CatecProjeto
  fluxo: UseProjetoFluxoStore
  onStatusAlterado?: () => Promise<void>
}

const ORDEM_TIPO: CatecTipoInteracaoFluxo[] = [
  'CONSIDERACOES_CLIENTE',
  'ACEITE_CLIENTE',
  'RECUSA_CLIENTE'
]

const ProjetoTabInteracoes = ({ projeto, fluxo, onStatusAlterado }: Props) => {
  const { data, podeRegistrarInteracao, registrarInteracao } = fluxo
  const [dialogAberto, setDialogAberto] = useState(false)
  const [tipo, setTipo] = useState<CatecTipoInteracaoFluxo>('CONSIDERACOES_CLIENTE')
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)

  const alvo = useMemo(() => {
    const prop = data.propostas.find(p => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null

    const cont =
      data.contrato && STATUS_CONTRATO_INTERACAO_CLIENTE.includes(data.contrato.status)
        ? data.contrato
        : null

    if (cont) {
      return {
        tipo: 'CONTRATO' as const,
        rotulos: TIPO_INTERACAO_ROTULO_CONTRATO,
        statusLabel: STATUS_CONTRATO_ROTULO[cont.status]
      }
    }

    if (prop) {
      return {
        tipo: 'PROPOSTA' as const,
        rotulos: TIPO_INTERACAO_ROTULO_PROPOSTA,
        statusLabel: STATUS_PROPOSTA_ROTULO[prop.status]
      }
    }

    return null
  }, [data])

  const timeline = data.interacoes.map(item => ({
    key: item.key,
    titulo: item.titulo,
    meta: item.meta,
    texto: item.texto
  }))

  function abrirDialog() {
    if (!alvo) return

    setTipo(alvo.tipo === 'CONTRATO' ? 'ACEITE_CLIENTE' : 'CONSIDERACOES_CLIENTE')
    setTexto('')
    setDialogAberto(true)
  }

  async function handleRegistrar() {
    if (!texto.trim()) {
      toast.error('Informe o texto da interação.')

      return
    }

    setSalvando(true)

    try {
      await registrarInteracao(tipo, texto)
      setDialogAberto(false)
      toast.success('Interação registrada.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao registrar interação.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      {projeto.status === 'AGUARDANDO_EXECUCAO' || projeto.status === 'EM_EXECUCAO' ? (
        <Card className='mbe-6'>
          <CardHeader title='Alteração de status' />
          <CardContent className='flex flex-wrap items-center gap-3'>
            <ProjetoEncerrarStatus projeto={projeto} onStatusAlterado={onStatusAlterado} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title='Interações com cliente'
          action={
            podeRegistrarInteracao ? (
              <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={abrirDialog}>
                Registrar
              </Button>
            ) : null
          }
        />
        <CardContent>
          {timeline.length === 0 ? (
            <ProjetoStateCard titulo='Nenhuma interação registrada.' />
          ) : (
            <ProjetoTimeline items={timeline} />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Registrar interação</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          {alvo ? (
            <CustomTextField
              fullWidth
              label='Contexto'
              value={`${alvo.tipo === 'CONTRATO' ? 'Contrato' : 'Proposta'} — ${alvo.statusLabel}`}
              disabled
            />
          ) : null}
          <CustomTextField
            select
            fullWidth
            label='Tipo'
            value={tipo}
            onChange={e => setTipo(e.target.value as CatecTipoInteracaoFluxo)}
          >
            {ORDEM_TIPO.map(opcao => (
              <MenuItem key={opcao} value={opcao}>
                {alvo?.rotulos[opcao] ?? opcao}
              </MenuItem>
            ))}
          </CustomTextField>
          <CustomTextField
            fullWidth
            multiline
            rows={4}
            label='Texto'
            value={texto}
            onChange={e => setTexto(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={() => setDialogAberto(false)}>
            Cancelar
          </Button>
          <Button variant='contained' disabled={salvando} onClick={() => void handleRegistrar()}>
            {salvando ? 'Salvando…' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProjetoTabInteracoes
