import type { Metadata } from 'next'

import Usuario2List from '@views/catec/usuarios/list'

export const metadata: Metadata = {
  title: 'Usuários — CATEC',
  description: 'Gestão de usuários CATEC'
}

const CatecUsuariosPage = () => {
  return <Usuario2List />
}

export default CatecUsuariosPage
