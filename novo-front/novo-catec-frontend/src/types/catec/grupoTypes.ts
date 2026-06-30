export type CatecGrupo = {
  id: number
  codigo: string
  nome: string
  descricao: string | null
  ativo: boolean
  sistema: boolean
  permissoes: string[]
  criadoEm: string
  atualizadoEm: string
}

export type CatecPermissaoCatalogo = {
  id: number
  codigo: string
  nome: string
  tipo: 'TELA' | 'ACAO'
  modulo: string
  descricao: string | null
}

export type CatecGrupoFormState = {
  nome: string
  descricao: string
  ativo: boolean
  permissoes: Set<string>
}

export const MODULO_LABEL: Record<string, string> = {
  acesso: 'Acesso',
  painel: 'Painel',
  projeto: 'Projeto',
  cliente: 'Clientes',
  usuario: 'Usuários',
  proposta: 'Propostas',
  contrato: 'Contrato',
  documento: 'Documentos',
  interacao: 'Interações',
  grupo: 'Grupos'
}

export function rotuloModulo(modulo: string): string {
  return MODULO_LABEL[modulo] ?? modulo.charAt(0).toUpperCase() + modulo.slice(1)
}

export function emptyGrupoForm(): CatecGrupoFormState {
  return {
    nome: '',
    descricao: '',
    ativo: true,
    permissoes: new Set()
  }
}

export function grupoToForm(grupo: CatecGrupo): CatecGrupoFormState {
  return {
    nome: grupo.nome,
    descricao: grupo.descricao ?? '',
    ativo: grupo.ativo,
    permissoes: new Set(grupo.permissoes)
  }
}

export function agruparPermissoesPorModulo(
  catalogo: CatecPermissaoCatalogo[]
): Map<string, CatecPermissaoCatalogo[]> {
  const map = new Map<string, CatecPermissaoCatalogo[]>()

  for (const p of catalogo) {
    const list = map.get(p.modulo) ?? []

    list.push(p)
    map.set(p.modulo, list)
  }

  for (const [modulo, list] of map) {
    list.sort((a, b) => {
      if (a.tipo !== b.tipo) return a.tipo === 'TELA' ? -1 : 1

      return a.nome.localeCompare(b.nome, 'pt-BR')
    })
    map.set(modulo, list)
  }

  return map
}

export function modulosOrdenados(map: Map<string, CatecPermissaoCatalogo[]>): string[] {
  return [...map.keys()].sort((a, b) => rotuloModulo(a).localeCompare(rotuloModulo(b), 'pt-BR'))
}

export function slugCodigoGrupo(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}
