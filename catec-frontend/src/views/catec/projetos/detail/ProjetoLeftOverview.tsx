'use client'

import type { CatecProjeto } from '@/types/catec/projetoTypes'

import ProjetoDetails from './ProjetoDetails'

type Props = {
  projeto: CatecProjeto
}

const ProjetoLeftOverview = ({ projeto }: Props) => {
  return <ProjetoDetails projeto={projeto} />
}

export default ProjetoLeftOverview
