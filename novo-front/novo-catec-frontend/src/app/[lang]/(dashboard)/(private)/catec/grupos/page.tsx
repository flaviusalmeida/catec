import type { Metadata } from 'next'

import GrupoList from '@views/catec/grupos/list'

export const metadata: Metadata = {
  title: 'Grupos — CATEC',
  description: 'Gestão de grupos de acesso CATEC'
}

const CatecGruposPage = () => {
  return <GrupoList />
}

export default CatecGruposPage
