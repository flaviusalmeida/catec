'use client'

import { useMemo, useState, type ReactNode } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecProjeto } from '@/types/catec/projetoTypes'
import {
  STATUS_PROPOSTA_ENVIADA,
  STATUS_PROPOSTA_ROTULO,
  STATUS_PROPOSTA_UPLOAD
} from '@/types/catec/projetoFluxoTypes'

import {
  formatarDataCurta,
  formatarDataHora,
  resolvePropostaWorkflowActions
} from '../projetoFluxoHelpers'
import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoFileRow from './ProjetoFileRow'
import ProjetoStateCard from './ProjetoStateCard'
import ProjetoUploadCard from './ProjetoUploadCard'

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

const ProjetoTabPropostas = ({ projeto, fluxo }: Props) => {
  const { data, propostaAtual, uploadProposta, acaoProposta } = fluxo
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
        requerAvaliacaoSocio: propostaAtual.requerAvaliacaoSocio,
        avaliadaSocioEm: propostaAtual.avaliadaSocioEm
      })
    : []

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
                  onDownload={() => toast.info('Download simulado (mock).')}
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
                    onDownload={() => toast.info('Download simulado (mock).')}
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

      {workflowActions.length > 0 ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardContent className='flex flex-wrap gap-3'>
              {workflowActions.map(acao => (
                <Button
                  key={acao.key}
                  variant={acao.color === 'primary' ? 'contained' : 'tonal'}
                  color={acao.color === 'error' ? 'error' : acao.color === 'secondary' ? 'secondary' : 'primary'}
                  onClick={() => {
                    acaoProposta(acao.key as Parameters<typeof acaoProposta>[0])
                    toast.success(`Ação "${acao.label}" executada (mock).`)
                  }}
                >
                  {acao.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ) : null}
    </Grid>
  )
}

export default ProjetoTabPropostas
