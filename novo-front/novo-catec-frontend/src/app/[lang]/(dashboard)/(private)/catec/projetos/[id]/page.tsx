import type { Metadata } from 'next'

import ProjetoDetalhe from '@views/catec/projetos/detail'

export const metadata: Metadata = {
  title: 'Detalhe do projeto — CATEC',
  description: 'Fluxo comercial e execução do projeto CATEC'
}

type Props = {
  params: Promise<{ id: string }>
}

const CatecProjetoDetalhePage = async ({ params }: Props) => {
  const { id } = await params

  return <ProjetoDetalhe id={id} />
}

export default CatecProjetoDetalhePage
