'use client'

import { useRef } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import ProjetoFileRow from './ProjetoFileRow'

type AcaoUpload = {
  key: string
  label: string
  color: 'primary' | 'secondary' | 'error'
  onClick: () => void
}

type Props = {
  titulo: string
  nomeArquivo?: string | null
  meta?: string
  disabled?: boolean
  permitirSubstituir?: boolean
  onUpload: (file: File) => Promise<void>
  onDownload?: () => void
  acoes?: AcaoUpload[]
}

const ProjetoUploadCard = ({
  titulo,
  nomeArquivo,
  meta,
  disabled,
  permitirSubstituir = true,
  onUpload,
  onDownload,
  acoes
}: Props) => {
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
        {permitirSubstituir ? (
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
        ) : null}
        {nomeArquivo && acoes && acoes.length > 0 ? (
          <div className='flex flex-wrap gap-3 pt-2 border-t'>
            {acoes.map(acao => (
              <Button
                key={acao.key}
                variant={acao.color === 'primary' ? 'contained' : 'tonal'}
                color={acao.color === 'error' ? 'error' : acao.color === 'secondary' ? 'secondary' : 'primary'}
                disabled={disabled}
                onClick={acao.onClick}
              >
                {acao.label}
              </Button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default ProjetoUploadCard
