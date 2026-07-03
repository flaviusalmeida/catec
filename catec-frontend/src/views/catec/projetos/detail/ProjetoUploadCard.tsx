'use client'

import { useRef, type ReactNode } from 'react'

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
  alinhamento?: 'inicio' | 'fim'
}

type Props = {
  titulo: string
  nomeArquivo?: string | null
  meta?: string
  disabled?: boolean
  permitirSubstituir?: boolean
  onUpload: (file: File) => Promise<void>
  onDownload?: () => void
  tituloExtra?: ReactNode
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
  tituloExtra,
  acoes
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const acoesInicio = nomeArquivo ? (acoes?.filter(acao => acao.alinhamento === 'inicio') ?? []) : []
  const acoesFim = nomeArquivo ? (acoes?.filter(acao => acao.alinhamento !== 'inicio') ?? []) : []
  const temLinhaAcoes = permitirSubstituir || acoesInicio.length > 0 || acoesFim.length > 0

  function renderAcao(acao: AcaoUpload) {
    const variant =
      acao.alinhamento === 'inicio' ? 'outlined' : acao.color === 'primary' || acao.color === 'error' ? 'contained' : 'outlined'

    return (
      <Button
        key={acao.key}
        variant={variant}
        color={acao.color === 'error' ? 'error' : acao.color === 'secondary' ? 'secondary' : 'primary'}
        disabled={disabled}
        onClick={acao.onClick}
      >
        {acao.label}
      </Button>
    )
  }

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
      <CardHeader title={titulo} action={tituloExtra} />
      <CardContent className='flex flex-col gap-4'>
        {nomeArquivo ? (
          <ProjetoFileRow nomeArquivo={nomeArquivo} meta={meta} onDownload={onDownload} />
        ) : (
          <Typography color='text.secondary'>Nenhum documento anexado.</Typography>
        )}
        {temLinhaAcoes ? (
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex flex-wrap gap-3'>
              {permitirSubstituir ? (
                <>
                  <input
                    ref={inputRef}
                    type='file'
                    accept='.pdf,.doc,.docx'
                    className='hidden'
                    onChange={e => void handleFileChange(e)}
                  />
                  <Button
                    variant={nomeArquivo ? 'outlined' : 'contained'}
                    startIcon={<i className='tabler-upload' />}
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                  >
                    {nomeArquivo ? 'Trocar arquivo' : 'Selecionar arquivo'}
                  </Button>
                </>
              ) : null}
              {acoesInicio.map(renderAcao)}
            </div>
            {acoesFim.length > 0 ? <div className='flex flex-wrap gap-3'>{acoesFim.map(renderAcao)}</div> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default ProjetoUploadCard
