'use client'

import { useState } from 'react'

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
import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_CONTRATO_ROTULO,
  STATUS_CONTRATO_UPLOAD,
  TIPO_INTERACAO_ROTULO_CONTRATO,
  type CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'

import { downloadDocumentoCatec } from '@/utils/catec/downloadDocumento'

import { useCatecPermission } from '@/hooks/useCatecPermission'
import { PermissaoCodigo } from '@/types/catec/permissao'

import { formatarDataCurta, projetoPermiteEditarContrato, projetoPermiteVisualizarContrato } from '../projetoFluxoHelpers'
import ContratoStatusBadge from '../ContratoStatusBadge'
import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoFileRow from './ProjetoFileRow'
import ProjetoStateCard from './ProjetoStateCard'
import ProjetoUploadCard from './ProjetoUploadCard'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  projeto: CatecProjeto
  fluxo: UseProjetoFluxoStore
}

type DialogInteracaoCliente = CatecTipoInteracaoFluxo | null

const ProjetoTabContrato = ({ projeto, fluxo }: Props) => {
  const { data, uploadContrato, enviarContratoCliente, registrarInteracao, processando } = fluxo
  const { hasPermission } = useCatecPermission()
  const [dialogInteracaoCliente, setDialogInteracaoCliente] = useState<DialogInteracaoCliente>(null)
  const [textoInteracaoCliente, setTextoInteracaoCliente] = useState('')

  const contrato = data.contrato
  const documentoAtual = contrato?.documentos[0] ?? null
  const temAnexo = Boolean(documentoAtual)

  const podeEditarContrato = projetoPermiteEditarContrato(projeto.status)
  const podeVisualizarContrato = projetoPermiteVisualizarContrato(projeto.status, contrato != null)

  const aguardandoRespostaCliente =
    contrato != null && STATUS_CONTRATO_INTERACAO_CLIENTE.includes(contrato.status)

  const podeRegistrarRespostaCliente =
    aguardandoRespostaCliente && hasPermission(PermissaoCodigo.ACAO_INTERACAO_REGISTRAR)

  const acoesRespostaCliente: Array<{
    tipo: CatecTipoInteracaoFluxo
    label: string
    color: 'primary' | 'success' | 'error' | 'secondary'
    variant: 'contained' | 'tonal'
  }> =
    contrato?.status === 'AGUARDANDO_AJUSTE'
      ? [
          {
            tipo: 'ACEITE_CLIENTE',
            label: TIPO_INTERACAO_ROTULO_CONTRATO.ACEITE_CLIENTE,
            color: 'success',
            variant: 'contained'
          },
          {
            tipo: 'RECUSA_CLIENTE',
            label: TIPO_INTERACAO_ROTULO_CONTRATO.RECUSA_CLIENTE,
            color: 'error',
            variant: 'tonal'
          }
        ]
      : [
          {
            tipo: 'CONSIDERACOES_CLIENTE',
            label: TIPO_INTERACAO_ROTULO_CONTRATO.CONSIDERACOES_CLIENTE,
            color: 'secondary',
            variant: 'tonal'
          },
          {
            tipo: 'ACEITE_CLIENTE',
            label: TIPO_INTERACAO_ROTULO_CONTRATO.ACEITE_CLIENTE,
            color: 'success',
            variant: 'contained'
          },
          {
            tipo: 'RECUSA_CLIENTE',
            label: TIPO_INTERACAO_ROTULO_CONTRATO.RECUSA_CLIENTE,
            color: 'error',
            variant: 'tonal'
          }
        ]

  const acoesRespostaClienteCard = podeRegistrarRespostaCliente
    ? acoesRespostaCliente.map(acao => ({
        key: acao.tipo,
        label: acao.label,
        color: acao.color,
        onClick: () => abrirDialogInteracaoCliente(acao.tipo)
      }))
    : []

  function abrirDialogInteracaoCliente(tipo: CatecTipoInteracaoFluxo) {
    setDialogInteracaoCliente(tipo)
    setTextoInteracaoCliente('')
  }

  function fecharDialogInteracaoCliente() {
    if (processando) return

    setDialogInteracaoCliente(null)
    setTextoInteracaoCliente('')
  }

  function confirmarInteracaoCliente() {
    if (!dialogInteracaoCliente) return

    if (!textoInteracaoCliente.trim()) {
      toast.error('Informe o texto da interação.')

      return
    }

    void registrarInteracao(dialogInteracaoCliente, textoInteracaoCliente.trim())
      .then(() => {
        toast.success('Resposta do cliente registrada.')
        setDialogInteracaoCliente(null)
        setTextoInteracaoCliente('')
      })
      .catch(err => toast.error(err instanceof Error ? err.message : 'Erro ao registrar interação.'))
  }

  function handleEnviarContratoCliente() {
    void enviarContratoCliente()
      .then(() => toast.success('Contrato enviado ao cliente.'))
      .catch(err => toast.error(err instanceof Error ? err.message : 'Envio falhou.'))
  }

  if (!podeVisualizarContrato) {
    return (
      <ProjetoStateCard
        titulo='Contrato indisponível no momento.'
        descricao='Disponível em etapas posteriores.'
        tipo='locked'
      />
    )
  }

  const podeIniciarContrato = podeEditarContrato && !contrato
  const podeUploadExistente =
    podeEditarContrato && contrato != null && STATUS_CONTRATO_UPLOAD.includes(contrato.status)

  const podeEnviarCliente = podeEditarContrato && contrato?.status === 'RASCUNHO' && temAnexo

  const mostrarEnviarContratoCard = Boolean(contrato && contrato.status === 'RASCUNHO' && temAnexo && podeEnviarCliente)

  const mostrarRespostaClienteCard = contrato?.status === 'ENVIADO_AO_CLIENTE' && temAnexo

  const mostrarContratoAceitoCard = contrato?.status === 'ACEITO' && temAnexo

  const mostrarUploadCard = Boolean(
    podeIniciarContrato ||
      (podeUploadExistente &&
        (contrato?.status === 'AGUARDANDO_AJUSTE' || (contrato?.status === 'RASCUNHO' && !temAnexo)))
  )

  const metaDocumento = documentoAtual
    ? `Versão ${documentoAtual.versao}${documentoAtual.criadoEm ? ` • ${formatarDataCurta(documentoAtual.criadoEm)}` : ''}`
    : undefined

  const downloadDocumento = documentoAtual
    ? () =>
        void downloadDocumentoCatec(documentoAtual.id, documentoAtual.nomeOriginal).catch(err =>
          toast.error(err instanceof Error ? err.message : 'Download falhou.')
        )
    : undefined

  const previewContratoSubtitulo = documentoAtual
    ? `${projeto.titulo} · v${documentoAtual.versao}`
    : projeto.titulo

  const previewDocumentoProps = documentoAtual
    ? {
        documentoId: documentoAtual.id,
        previewTitulo: 'Contrato' as const,
        previewSubtitulo: previewContratoSubtitulo
      }
    : {}

  if (!contrato && !mostrarUploadCard) {
    return <ProjetoStateCard titulo='Nenhum contrato cadastrado.' />
  }

  return (
    <Grid container spacing={6}>
      {mostrarUploadCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Enviar contrato'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={metaDocumento}
            arquivoExtra={contrato ? <ContratoStatusBadge status={contrato.status} /> : undefined}
            onUpload={uploadContrato}
            disabled={processando}
            onDownload={downloadDocumento}
            {...previewDocumentoProps}
            acoes={
              contrato?.status === 'AGUARDANDO_AJUSTE' && acoesRespostaClienteCard.length > 0
                ? acoesRespostaClienteCard
                : undefined
            }
          />
        </Grid>
      ) : null}

      {mostrarEnviarContratoCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Enviar contrato'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={metaDocumento}
            arquivoExtra={contrato ? <ContratoStatusBadge status={contrato.status} /> : undefined}
            onUpload={uploadContrato}
            disabled={processando}
            onDownload={downloadDocumento}
            {...previewDocumentoProps}
            acoes={[
              {
                key: 'enviar-cliente',
                label: 'Enviar ao cliente',
                color: 'primary',
                alinhamento: 'fim',
                onClick: handleEnviarContratoCliente
              }
            ]}
          />
        </Grid>
      ) : null}

      {mostrarRespostaClienteCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Resposta do cliente'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={metaDocumento}
            arquivoExtra={contrato ? <ContratoStatusBadge status={contrato.status} /> : undefined}
            permitirSubstituir={false}
            disabled={processando}
            onUpload={uploadContrato}
            onDownload={downloadDocumento}
            {...previewDocumentoProps}
            acoes={acoesRespostaClienteCard.length > 0 ? acoesRespostaClienteCard : undefined}
          />
        </Grid>
      ) : null}

      {mostrarContratoAceitoCard ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoUploadCard
            titulo='Contrato aceito'
            nomeArquivo={documentoAtual?.nomeOriginal}
            meta={metaDocumento}
            arquivoExtra={contrato ? <ContratoStatusBadge status={contrato.status} /> : undefined}
            permitirSubstituir={false}
            disabled={processando}
            onUpload={uploadContrato}
            onDownload={downloadDocumento}
            {...previewDocumentoProps}
          />
        </Grid>
      ) : null}

      {contrato?.status === 'RECUSADO' ? (
        <Grid size={{ xs: 12 }}>
          <ProjetoStateCard titulo='Contrato recusado.' tipo='info' />
        </Grid>
      ) : null}

      {contrato &&
      !mostrarUploadCard &&
      !mostrarEnviarContratoCard &&
      !mostrarRespostaClienteCard &&
      !mostrarContratoAceitoCard &&
      contrato.status !== 'RECUSADO' &&
      temAnexo ? (
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined'>
            <CardHeader title='Documento do contrato' />
            <CardContent className='flex flex-col gap-3'>
              {contrato.documentos.map(doc => (
                <ProjetoFileRow
                  key={doc.id}
                  nomeArquivo={doc.nomeOriginal}
                  meta={`Versão ${doc.versao}${doc.criadoEm ? ` • ${formatarDataCurta(doc.criadoEm)}` : ''}`}
                  extra={<ContratoStatusBadge status={contrato.status} />}
                  documentoId={doc.id}
                  previewTitulo='Contrato'
                  previewSubtitulo={previewContratoSubtitulo}
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

      <Dialog open={dialogInteracaoCliente != null} onClose={fecharDialogInteracaoCliente} fullWidth maxWidth='sm'>
        <DialogTitle>
          {dialogInteracaoCliente ? TIPO_INTERACAO_ROTULO_CONTRATO[dialogInteracaoCliente] : 'Registrar resposta'}
        </DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          {contrato ? (
            <Typography variant='body2' color='text.secondary'>
              {projeto.titulo} · {STATUS_CONTRATO_ROTULO[contrato.status]}
            </Typography>
          ) : null}
          <CustomTextField
            fullWidth
            multiline
            minRows={3}
            label='Texto'
            value={textoInteracaoCliente}
            onChange={e => setTextoInteracaoCliente(e.target.value)}
            placeholder='Descreva a resposta ou considerações do cliente.'
          />
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={fecharDialogInteracaoCliente} disabled={processando}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color={
              dialogInteracaoCliente === 'RECUSA_CLIENTE'
                ? 'error'
                : dialogInteracaoCliente === 'ACEITE_CLIENTE'
                  ? 'success'
                  : 'primary'
            }
            onClick={confirmarInteracaoCliente}
            disabled={processando || !textoInteracaoCliente.trim()}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ProjetoTabContrato
