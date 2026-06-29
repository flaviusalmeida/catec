import type { Metadata } from 'next'

import ClienteList from '@views/catec/clientes/list'

export const metadata: Metadata = {
  title: 'Clientes — CATEC',
  description: 'Gestão de clientes CATEC'
}

const CatecClientesPage = () => {
  return <ClienteList />
}

export default CatecClientesPage
