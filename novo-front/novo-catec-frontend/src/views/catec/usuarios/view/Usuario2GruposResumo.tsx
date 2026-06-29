'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'
import { GRUPOS_OPCOES, rotuloGrupo } from '@/types/catec/usuarioTypes'

type Props = {
  usuario: CatecAdminUsuario
}

const Usuario2GruposResumo = ({ usuario }: Props) => {
  const gruposAtivos = new Set(usuario.grupos)

  return (
    <Card className='border-2 border-primary rounded shadow-primarySm'>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex justify-between items-center'>
          <Typography variant='h6'>Grupos de acesso</Typography>
          <Chip label={`${usuario.grupos.length} ativos`} size='small' color='primary' variant='tonal' />
        </div>
        <div className='flex flex-col gap-2'>
          {GRUPOS_OPCOES.filter(g => gruposAtivos.has(g.valor)).map(g => (
            <div key={g.valor} className='flex items-center gap-2'>
              <i className='tabler-circle-filled text-[10px] text-primary' />
              <Typography component='span'>{g.rotulo}</Typography>
            </div>
          ))}
          {usuario.grupos.length === 0 ? (
            <Typography color='text.secondary'>Nenhum grupo atribuído.</Typography>
          ) : null}
        </div>
        <Typography variant='body2' color='text.secondary'>
          Perfil principal: <strong>{rotuloGrupo(usuario.grupos[0] ?? '')}</strong>
        </Typography>
      </CardContent>
    </Card>
  )
}

export default Usuario2GruposResumo
