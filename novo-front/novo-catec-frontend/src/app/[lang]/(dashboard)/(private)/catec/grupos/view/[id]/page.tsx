import type { Metadata } from 'next'

import GrupoView from '@views/catec/grupos/view'

export const metadata: Metadata = {
  title: 'Grupo de acesso — CATEC',
  description: 'Edição de grupo e permissões CATEC'
}

type Props = {
  params: Promise<{ id: string }>
}

const CatecGrupoViewPage = async ({ params }: Props) => {
  const { id } = await params

  return <GrupoView id={id} />
}

export default CatecGrupoViewPage
