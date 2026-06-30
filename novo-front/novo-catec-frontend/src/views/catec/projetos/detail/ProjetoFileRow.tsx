'use client'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type Props = {
  nomeArquivo: string
  meta?: string
  onDownload?: () => void
}

const ProjetoFileRow = ({ nomeArquivo, meta, onDownload }: Props) => {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 rounded border p-4'>
      <div className='flex items-center gap-3 min-is-0'>
        <i className='tabler-file-type-pdf text-2xl text-error' />
        <div className='min-is-0'>
          <Typography className='font-medium truncate'>{nomeArquivo}</Typography>
          {meta ? (
            <Typography variant='caption' color='text.secondary'>
              {meta}
            </Typography>
          ) : null}
        </div>
      </div>
      {onDownload ? (
        <Button size='small' variant='tonal' startIcon={<i className='tabler-download' />} onClick={onDownload}>
          Baixar
        </Button>
      ) : null}
    </div>
  )
}

export default ProjetoFileRow
