'use client'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'
import { rotuloGrupo } from '@/types/catec/usuarioTypes'
import type { Locale } from '@configs/i18n'

import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

import UsuarioStatusBadge from '@views/catec/usuarios/UsuarioStatusBadge'

type Props = {
  usuario: CatecAdminUsuario
}

const Usuario2Details = ({ usuario }: Props) => {
  const { lang: locale } = useParams()

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col items-center gap-4'>
              <CustomAvatar variant='rounded' size={120}>
                {getInitials(usuario.nome)}
              </CustomAvatar>
              <Typography variant='h5'>{usuario.nome}</Typography>
            </div>
            <div className='flex flex-wrap gap-2 justify-center'>
              {usuario.grupos.map(g => (
                <Chip key={g} label={rotuloGrupo(g)} size='small' variant='tonal' color='secondary' />
              ))}
            </div>
            <UsuarioStatusBadge ativo={usuario.ativo} requerTrocaSenha={usuario.requerTrocaSenha} />
          </div>
          <div className='flex items-center justify-around flex-wrap gap-4'>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' color='primary' skin='light'>
                <i className='tabler-users-group' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{usuario.grupos.length}</Typography>
                <Typography>Grupos</Typography>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' color='primary' skin='light'>
                <i className='tabler-mail' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>1</Typography>
                <Typography>E-mail</Typography>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Typography variant='h5'>Detalhes</Typography>
          <Divider className='mlb-4' />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                E-mail:
              </Typography>
              <Typography>{usuario.email}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Telefone:
              </Typography>
              <Typography>{usuario.telefone ?? '—'}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Status:
              </Typography>
              <UsuarioStatusBadge ativo={usuario.ativo} requerTrocaSenha={usuario.requerTrocaSenha} />
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Grupos:
              </Typography>
              <Typography>{usuario.grupos.map(rotuloGrupo).join(', ')}</Typography>
            </div>
          </div>
        </div>

        <div className='flex gap-4 justify-center'>
          <Button
            variant='tonal'
            color='secondary'
            component={Link}
            href={getLocalizedUrl('/catec/usuarios', locale as Locale)}
            startIcon={<i className='tabler-arrow-left' />}
          >
            Voltar à lista
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Usuario2Details
