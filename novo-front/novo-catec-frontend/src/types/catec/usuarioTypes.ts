export type CatecGrupoValor =
  | 'COLABORADOR'
  | 'ADMINISTRATIVO'
  | 'SOCIO'
  | 'SALA_TECNICA'
  | 'CAMPO'
  | 'FINANCEIRO'

export type CatecAdminUsuario = {
  id: number
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
  requerTrocaSenha: boolean
  grupos: CatecGrupoValor[]
}

export type CatecUsuarioFormState = {
  nome: string
  email: string
  telefone: string
  ativo: boolean
  grupos: Set<CatecGrupoValor>
}

export const GRUPOS_OPCOES: ReadonlyArray<{
  valor: CatecGrupoValor
  rotulo: string
  detalhe: string
}> = [
  {
    valor: 'COLABORADOR',
    rotulo: 'Colaborador',
    detalhe: 'Operações do dia a dia, sem gestão de usuários.'
  },
  {
    valor: 'ADMINISTRATIVO',
    rotulo: 'Administrativo',
    detalhe: 'Gestão de usuários e cadastros administrativos sensíveis.'
  },
  {
    valor: 'SOCIO',
    rotulo: 'Sócio',
    detalhe: 'Visão estratégica, aprovações e direcionamento de alto nível.'
  },
  {
    valor: 'SALA_TECNICA',
    rotulo: 'Sala técnica',
    detalhe: 'Análises técnicas e apoio especializado interno.'
  },
  {
    valor: 'CAMPO',
    rotulo: 'Campo',
    detalhe: 'Inspeções, medições e registos em obra.'
  },
  {
    valor: 'FINANCEIRO',
    rotulo: 'Financeiro',
    detalhe: 'Faturação, pagamentos e relatórios financeiros.'
  }
]

export function rotuloGrupo(valor: string): string {
  return GRUPOS_OPCOES.find(g => g.valor === valor)?.rotulo ?? valor
}
