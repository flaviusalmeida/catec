'use client'

import { useMemo, useState, type ReactNode } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecProjeto } from '@/types/catec/projetoTypes'
import type { CatecPropostaWorkflowActionKey } from '@/types/catec/projetoFluxoTypes'
import {
  STATUS_PROPOSTA_ENVIADA,
  STATUS_PROPOSTA_ROTULO,
  STATUS_PROPOSTA_UPLOAD
} from '@/types/catec/projetoFluxoTypes'

import { downloadDocumentoCatec } from '@/utils/catec/downloadDocumento'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'

import {
  formatarDataCurta,
  formatarDataHora,
  resolvePropostaWorkflowActions
} from '../projetoFluxoHelpers'
import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoFileRow from './ProjetoFileRow'
import ProjetoStateCard from './ProjetoStateCard'
import ProjetoUploadCard from './ProjetoUploadCard'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  projeto: CatecProjeto
  fluxo: UseProjetoFluxoStore
}

function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant='caption' color='text.secondary' className='block mbe-1'>
        {label}
      </Typography>
      <Typography variant='body1'>{children}</Typography>
    </Grid>
  )
}

type DialogParecerMode = 'aprovar-socio' | 'reprovar-socio' | null

const ProjetoTabPropostas = ({ projeto, fluxo }: Props) => {
  const { data, propostaAtual, uploadProposta, acaoProposta, processando } = fluxo
  const { hasPermission } = useCatecPermission()
  const [dialogParecer, setDialogParecer] = useState<DialogParecerMode>(null)
  const [observacao, setObservacao] = useState('')
  const projetoTemCliente = projeto.clienteId != null

  const documentoAtual = propostaAtual?.documentos[0] ?? null
  const temAnexo = Boolean(documentoAtual)
  const temPropostaAtiva = data.propostas.some(p => p.status === 'RASCUNHO' || p.status === 'PENDENTE_AVALIACAO')

  const aguardandoAjuste = data.propostas.some(
    p => p.status === 'AGUARDANDO_AJUSTE' || p.consideracoesPendentes
  )

  const podeIniciarProposta =
    projetoTemCliente &&
    !temPropostaAtiva &&
    (data.propostas.length === 0 || aguardandoAjuste)

  const podeUploadExistente =
    propostaAtual != null && STATUS_PROPOSTA_UPLOAD.includes(propostaAtual.status)

  const mostrarUpload = projetoTemCliente && (podeUploadExistente || podeIniciarProposta)
  const mostrarUploadCard = mostrarUpload && (propostaAtual == null || propostaAtual.status === 'RASCUNHO')

  const versoesAnteriores = useMemo(() => {
    if (!propostaAtual) return data.propostas

    return data.propostas.filter(
      p => p.id !== propostaAtual.id && STATUS_PROPOSTA_ENVIADA.includes(p.status) && p.documentos.length > 0
    )
  }, [data.propostas, propostaAtual])

  const workflowActions = propostaAtual
    ? resolvePropostaWorkflowActions(propostaAtual.status, {
        hasAttachment: temAnexo,
        avaliadaSocioEm: propostaAtual.avaliadaSocioEm,
        podeAprovarSocio: hasPermission(PermissaoCodigo.ACAO_SOCIO_PROPOSTA_APROVAR),
        podeDevolverSocio: hasPermission(PermissaoCodigo.ACAO_SOCIO_PROPOSTA_DEVOLVER)
      })
    : []

  const acoesRascunho = workflowActions.filter(acao => acao.key === 'solicitar-revisao' || acao.key === 'enviar-cliente')

  const acoesWorkflowRestantes = workflowActions.filter(
    acao => acao.key !== 'solicitar-revisao' && acao.key !== 'enviar-cliente'
  )

  function executarAcaoProposta(
    key: CatecPropostaWorkflowActionKey,
    label: string,
    parecer?: string
  ) {
    void acaoProposta(key, parecer)
      .then(() => toast.success(`Ação "${label}" executada.`))
      .catch(err => toast.error(err instanceof Error ? err.message : 'Ação não concluída.'))
  }

  function abrirDialogParecer(mode: Exclude<DialogParecerMode, null>) {
    setDialogParecer(mode)
    setObservacao('')
  }

  function fecharDialogParecer() {
    if (processando) return

    setDialogParecer(null)
    setObservacao('')
  }

  function confirmarDialogParecer() {
    if (!dialogParecer) return

    if (dialogParecer === 'reprovar-socio' && !observacao.trim()) {
      toast.error('Informe o parecer ao devolver a proposta para elaboração.')

      return
    }

    const label = dialogParecer === 'aprovar-socio' ? 'Aprovar' : 'Reprovar'

    void acaoProposta(dialogParecer, observacao.trim() || undefined)
      .then(() => {
        toast.success(`Ação "${label}" executada.`)
        setDialogParecer(null)
        setObservacao('')
      })
      .catch(err => toast.error(err instanceof Error ? err.message : 'Ação não concluída.'))
  }

  function handleAcaoWorkflow(key: CatecPropostaWorkflowActionKey, label: string) {
    if (key === 'aprovar-socio' || key === 'reprovar-socio') {
      abrirDialogParecer(key)

      return
    }

    executarAcaoProposta(key, label)
  }

  if (!projetoTemCliente) {
    return (
      <ProjetoStateCard
        titulo='Nenhuma proposta cadastrada.'
        descricao='Associe um cliente ao projeto.'
      />
    )
  }

  if (data.propostas.length === 0 && !mostrarUpload) {
    return <ProjetoStateCard titulo='Nenhuma proposta cadastrada.' />
  }

  return (
    <Grid container spacing={6}>
      {mostrarUploadCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Enviar proposta'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={
              documentoAtual
                ? `Versão ${propostaAtual?.versao ?? '—'}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ''}`
                : undefined
            }
            onUpload={uploadProposta}
            disabled={processando}
            onDownload={
              documentoAtual
                ? () =>
                    void downloadDocumentoCatec(documentoAtual.id, documentoAtual.nomeOriginal).catch(err =>
                      toast.error(err instanceof Error ? err.message : 'Download falhou.')
                    )
                : undefined
            }
            acoes={acoesRascunho.map(acao => ({
              ...acao,
              onClick: () => handleAcaoWorkflow(acao.key as CatecPropostaWorkflowActionKey, acao.label)
            }))}
          />
        </Grid>
      ) : null}

      {propostaAtual ? (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Proposta atual' subheader={`Versão ${propostaAtual.versao}`} />
            <CardContent>
              <Grid container spacing={4}>
                <InfoField label='Status'>{STATUS_PROPOSTA_ROTULO[propostaAtual.status]}</InfoField>
                <InfoField label='Responsável'>{propostaAtual.elaboradoPorNome || '—'}</InfoField>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {propostaAtual && !mostrarUploadCard && temAnexo ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader
              title={
                STATUS_PROPOSTA_ENVIADA.includes(propostaAtual.status)
                  ? 'Documento da proposta'
                  : 'Documento da proposta em elaboração'
              }
            />
            <CardContent className='flex flex-col gap-3'>
              {propostaAtual.documentos.map(doc => (
                <ProjetoFileRow
                  key={doc.id}
                  nomeArquivo={doc.nomeOriginal}
                  meta={`Versão ${propostaAtual.versao}${doc.criadoEm ? ` • ${formatarDataCurta(doc.criadoEm)}` : ''}`}
                  onDownload={() =>
                    void downloadDocumentoCatec(doc.id, doc.nomeOriginal).catch(err =>
                      toast.error(err instanceof Error ? err.message : 'Download falhou.')
                    )
                  }
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {versoesAnteriores.length > 0 ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader title='Versões anteriores' />
            <CardContent className='flex flex-col gap-3'>
              {versoesAnteriores.map(proposta => {
                const doc = proposta.documentos[0]

                if (!doc) return null

                const titulo = proposta.enviadaClienteEm
                  ? `v${proposta.versao} — enviada em ${formatarDataHora(proposta.enviadaClienteEm)}`
                  : `v${proposta.versao} — ${STATUS_PROPOSTA_ROTULO[proposta.status]}`

                return (
                  <ProjetoFileRow
                    key={proposta.id}
                    nomeArquivo={doc.nomeOriginal}
                    meta={`Versão ${proposta.versao} • ${titulo}`}
                    onDownload={() =>
                    void downloadDocumentoCatec(doc.id, doc.nomeOriginal).catch(err =>
                      toast.error(err instanceof Error ? err.message : 'Download falhou.')
                    )
                  }
                  />
                )
              })}
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {propostaAtual?.status === 'ACEITA' ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoStateCard titulo='Proposta aprovada.' tipo='info' />
        </Grid>
      ) : null}

      {propostaAtual?.status === 'NEGADA' ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoStateCard titulo='Proposta reprovada.' tipo='info' />
        </Grid>
      ) : null}

      {acoesWorkflowRestantes.length > 0 ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardContent className='flex flex-wrap gap-3'>
              {acoesWorkflowRestantes.map(acao => (
                <Button
                  key={acao.key}
                  variant={acao.color === 'primary' ? 'contained' : 'tonal'}
                  color={acao.color === 'error' ? 'error' : acao.color === 'secondary' ? 'secondary' : 'primary'}
                  onClick={() => handleAcaoWorkflow(acao.key as CatecPropostaWorkflowActionKey, acao.label)}
                  disabled={processando}
                >
                  {acao.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      <Dialog open={dialogParecer != null} onClose={fecharDialogParecer} fullWidth maxWidth='sm'>
        <DialogTitle>{dialogParecer === 'aprovar-socio' ? 'Aprovar proposta' : 'Devolver proposta'}</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          {propostaAtual ? (
            <Typography variant='body2' color='text.secondary'>
              {projeto.titulo} · v{propostaAtual.versao}
            </Typography>
          ) : null}
          <CustomTextField
            fullWidth
            multiline
            minRows={3}
            label={dialogParecer === 'reprovar-socio' ? 'Parecer (obrigatório)' : 'Observação (opcional)'}
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            placeholder={
              dialogParecer === 'reprovar-socio'
                ? 'Descreva os ajustes necessários na proposta.'
                : 'Comentário opcional sobre a aprovação.'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={fecharDialogParecer} disabled={processando}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color={dialogParecer === 'aprovar-socio' ? 'success' : 'error'}
            onClick={confirmarDialogParecer}
            disabled={processando || (dialogParecer === 'reprovar-socio' && !observacao.trim())}
          >
            {dialogParecer === 'aprovar-socio' ? 'Confirmar aprovação' : 'Confirmar devolução'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ProjetoTabPropostas
