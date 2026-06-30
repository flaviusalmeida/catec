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
  onUpload: (nomeArquivo: string) => void
}

const ProjetoUploadCard = ({ titulo, nomeArquivo, meta, disabled, onUpload }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    onUpload(file.name)
    toast.success(`Arquivo "${file.name}" anexado (mock).`)
    e.target.value = ''
  }

  return (
    <Card variant='outlined'>
      <CardHeader title={titulo} />
      <CardContent className='flex flex-col gap-4'>
        {nomeArquivo ? (
          <ProjetoFileRow
            nomeArquivo={nomeArquivo}
            meta={meta}
            onDownload={() => toast.info('Download simulado (mock).')}
          />
        ) : (
          <Typography color='text.secondary'>Nenhum documento anexado.</Typography>
        )}
        <div>
          <input
            ref={inputRef}
            type='file'
            accept='.pdf,.doc,.docx'
            className='hidden'
            onChange={handleFileChange}
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
