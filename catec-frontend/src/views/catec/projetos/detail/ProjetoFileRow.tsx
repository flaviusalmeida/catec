'use client'

import { useState, type ReactNode } from 'react'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import ProjetoDocumentoPreviewDrawer from './ProjetoDocumentoPreviewDrawer'

type Props = {
  nomeArquivo: string
  meta?: string
  extra?: ReactNode
  documentoId?: number
  previewTitulo?: string
  previewSubtitulo?: string
  onDownload?: () => void
}

const ProjetoFileRow = ({
  nomeArquivo,
  meta,
  extra,
  documentoId,
  previewTitulo,
  previewSubtitulo,
  onDownload
}: Props) => {
  const [previewAberto, setPreviewAberto] = useState(false)
  const podeVisualizar = documentoId != null && previewTitulo != null

  return (
    <>
      <div className='flex flex-wrap items-center justify-between gap-3 rounded border p-4'>
        <div className='flex items-center gap-3 min-is-0'>
          <i className='tabler-file-type-pdf text-2xl text-error shrink-0' />
          <div className='min-is-0'>
            <Typography className='font-medium truncate'>{nomeArquivo}</Typography>
            {meta ? (
              <Typography variant='caption' color='text.secondary' className='block'>
                {meta}
              </Typography>
            ) : null}
            {extra ? <div className='mts-2'>{extra}</div> : null}
          </div>
        </div>
        {podeVisualizar || onDownload ? (
          <div className='flex items-center gap-1 shrink-0'>
            {podeVisualizar ? (
              <Button
                size='small'
                variant='text'
                startIcon={<i className='tabler-eye' />}
                onClick={() => setPreviewAberto(true)}
              >
                Visualizar
              </Button>
            ) : null}
            {onDownload ? (
              <Button size='small' variant='text' startIcon={<i className='tabler-download' />} onClick={onDownload}>
                Baixar
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {podeVisualizar ? (
        <ProjetoDocumentoPreviewDrawer
          open={previewAberto}
          onClose={() => setPreviewAberto(false)}
          documentoId={documentoId}
          nomeArquivo={nomeArquivo}
          titulo={previewTitulo}
          subtitulo={previewSubtitulo}
          meta={meta}
        />
      ) : null}
    </>
  )
}

export default ProjetoFileRow
