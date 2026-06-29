import type { Metadata } from 'next'

import ClienteView from '@views/catec/clientes/view'

export const metadata: Metadata = {
  title: 'Detalhe do cliente — CATEC',
  description: 'Cadastro do cliente CATEC'
}

type Props = {
  params: Promise<{ id: string }>
}

const CatecClienteViewPage = async ({ params }: Props) => {
  const { id } = await params

  return <ClienteView id={id} />
}

export default CatecClienteViewPage
