'use client'

import type { ReactNode } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import type { CatecProjeto } from '@/types/catec/projetoTypes'
import { STATUS_CONTRATO_ROTULO, STATUS_CONTRATO_UPLOAD } from '@/types/catec/projetoFluxoTypes'

import { formatarDataCurta, projetoPermiteContrato } from '../projetoFluxoHelpers'
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

const ProjetoTabContrato = ({ projeto, fluxo }: Props) => {
  const { data, uploadContrato, enviarContratoCliente } = fluxo
  const contrato = data.contrato
  const documentoAtual = contrato?.documentos[0] ?? null
  const temAnexo = Boolean(documentoAtual)

  const mostrarContrato = projetoPermiteContrato(projeto.status)

  if (!mostrarContrato) {
    return (
      <ProjetoStateCard
        titulo='Contrato indisponível no momento.'
        descricao='Disponível em etapas posteriores.'
        tipo='locked'
      />
    )
  }

  const podeIniciarContrato = !contrato
  const podeUploadExistente = contrato != null && STATUS_CONTRATO_UPLOAD.includes(contrato.status)
  const mostrarUploadCard = Boolean(
    podeIniciarContrato ||
      (podeUploadExistente && (contrato?.status === 'RASCUNHO' || contrato?.status === 'AGUARDANDO_AJUSTE' || !temAnexo))
  )

  const podeEnviarCliente = contrato?.status === 'RASCUNHO' && temAnexo

  if (!contrato && !mostrarUploadCard) {
    return <ProjetoStateCard titulo='Nenhum contrato cadastrado.' />
  }

  return (
    <Grid container spacing={6}>
      {contrato ? (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Contrato' />
            <CardContent>
              <Grid container spacing={4}>
                <InfoField label='Status'>{STATUS_CONTRATO_ROTULO[contrato.status]}</InfoField>
                <InfoField label='Elaborado por'>{contrato.elaboradoPorNome || '—'}</InfoField>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {mostrarUploadCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Enviar contrato'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={
              documentoAtual
                ? `Versão ${documentoAtual.versao}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ''}${documentoAtual.uploadedPorNome ? ` • ${documentoAtual.uploadedPorNome}` : ''}`
                : undefined
            }
            onUpload={uploadContrato}
          />
        </Grid>
      ) : null}

      {!mostrarUploadCard && temAnexo && contrato ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader title='Documento do contrato' />
            <CardContent className='flex flex-col gap-3'>
              {contrato.documentos.map(doc => (
                <ProjetoFileRow
                  key={doc.id}
                  nomeArquivo={doc.nomeOriginal}
                  meta={`Versão ${doc.versao}${doc.criadoEm ? ` • ${formatarDataCurta(doc.criadoEm)}` : ''}`}
                  onDownload={() => toast.info('Download simulado (mock).')}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      ) : null}

      {podeEnviarCliente ? (
        <Grid size={{ xs: 12 }}>
          <Button
            variant='contained'
            startIcon={<i className='tabler-send' />}
            onClick={() => {
              enviarContratoCliente()
              toast.success('Contrato enviado ao cliente (mock).')
            }}
          >
            Enviar ao cliente
          </Button>
        </Grid>
      ) : null}
    </Grid>
  )
}

export default ProjetoTabContrato
