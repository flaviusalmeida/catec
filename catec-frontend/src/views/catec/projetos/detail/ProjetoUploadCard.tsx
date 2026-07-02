'use client'

import { useRef } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import ProjetoFileRow from './ProjetoFileRow'

type Props = {
  titulo: string
  nomeArquivo?: string | null
  meta?: string
  disabled?: boolean
  onUpload: (file: File) => Promise<void>
  onDownload?: () => void
}

const ProjetoUploadCard = ({ titulo, nomeArquivo, meta, disabled, onUpload, onDownload }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    try {
      await onUpload(file)
      toast.success(`Arquivo "${file.name}" anexado.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no upload.')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <Card variant='outlined'>
      <CardHeader title={titulo} />
      <CardContent className='flex flex-col gap-4'>
        {nomeArquivo ? (
          <ProjetoFileRow nomeArquivo={nomeArquivo} meta={meta} onDownload={onDownload} />
        ) : (
          <Typography color='text.secondary'>Nenhum documento anexado.</Typography>
        )}
        <div>
          <input
            ref={inputRef}
            type='file'
            accept='.pdf,.doc,.docx'
            className='hidden'
            onChange={e => void handleFileChange(e)}
          />
          <Button
            variant='contained'
            startIcon={<i className='tabler-upload' />}
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {nomeArquivo ? 'Substituir arquivo' : 'Selecionar arquivo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjetoUploadCard
