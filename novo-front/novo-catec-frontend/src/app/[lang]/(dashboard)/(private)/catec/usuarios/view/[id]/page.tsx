import type { Metadata } from 'next'

import Usuario2View from '@views/catec/usuarios/view'

export const metadata: Metadata = {
  title: 'Perfil do usuário — CATEC',
  description: 'Detalhe do usuário CATEC'
}

type Props = {
  params: Promise<{ id: string }>
}

const CatecUsuarioViewPage = async ({ params }: Props) => {
  const { id } = await params

  return <Usuario2View id={id} />
}

export default CatecUsuarioViewPage
