'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useSession } from 'next-auth/react'

// Type Imports
import type { Locale } from '@configs/i18n'
import { parseCatecLoginResponse } from '@/types/catec/authTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Lib Imports
import { catecApiFetch } from '@/libs/catecApi'

// Util Imports
import { getCatecHomeUrl } from '@/utils/catec/authPaths'

// Styled Component Imports
import AuthIllustrationWrapper from '@views/pages/auth/AuthIllustrationWrapper'

const DefinirSenha = () => {
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { lang: locale } = useParams()
  const { update } = useSession()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (senha !== confirmacao) {
      setError('As senhas não coincidem.')

      return
    }

    setLoading(true)

    try {
      const res = await catecApiFetch('/api/v1/auth/trocar-senha', {
        method: 'POST',
        body: JSON.stringify({ senhaNova: senha })
      })

      const text = await res.text()

      let data: unknown = null

      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = null
      }

      if (!res.ok) {
        const mensagem =
          data && typeof data === 'object' && 'mensagem' in data
            ? String((data as { mensagem?: string }).mensagem)
            : `Erro (${res.status})`

        setError(mensagem)

        return
      }

      const login = parseCatecLoginResponse(data)

      if (!login.accessToken) {
        setError('Resposta inválida do servidor.')

        return
      }

      await update({
        accessToken: login.accessToken,
        requerTrocaSenha: false,
        trocaSenhaObrigatoria: false
      })

      router.replace(getCatecHomeUrl(locale as Locale))
    } catch {
      setError('Não foi possível contatar o servidor. Verifique se a API está em execução.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <div className='flex justify-center mbe-6'>
            <Image
              src='/images/logo-catec.png'
              alt='CATEC — Assessoria em engenharia'
              width={200}
              height={112}
              priority
              className='object-contain'
            />
          </div>

          <Typography variant='h5' className='mbe-2'>
            Definir senha
          </Typography>
          <Typography variant='body2' color='text.secondary' className='mbe-6'>
            Escolha uma senha forte: pelo menos 12 caracteres, com maiúsculas, minúsculas, um dígito e um símbolo.
          </Typography>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Nova senha'
              type='password'
              value={senha}
              onChange={e => setSenha(e.target.value)}
              disabled={loading}
              slotProps={{ htmlInput: { minLength: 12 } }}
            />

            <CustomTextField
              fullWidth
              label='Confirmar senha'
              type='password'
              value={confirmacao}
              onChange={e => setConfirmacao(e.target.value)}
              disabled={loading}
              slotProps={{ htmlInput: { minLength: 12 } }}
            />

            {error ? (
              <Alert severity='error' variant='outlined'>
                {error}
              </Alert>
            ) : null}

            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar e continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default DefinirSenha
