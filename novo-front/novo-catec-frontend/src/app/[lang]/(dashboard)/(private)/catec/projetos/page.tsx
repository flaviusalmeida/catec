import type { Metadata } from 'next'

import ProjetoList from '@views/catec/projetos/list'

export const metadata: Metadata = {
  title: 'Projetos — CATEC',
  description: 'Gestão de projetos CATEC'
}

const CatecProjetosPage = () => {
  return <ProjetoList />
}

export default CatecProjetosPage
