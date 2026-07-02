import { PermissaoCodigo } from '@/types/catec/permissao'

export type SearchDataItem = {
  id: string
  name: string
  url: string
  icon: string
  section: string
  permission?: string
  shortcut?: string
}

const data: SearchDataItem[] = [
  {
    id: 'projetos',
    name: 'Projetos',
    url: '/catec/projetos',
    icon: 'tabler-briefcase',
    section: 'Menu',
    permission: PermissaoCodigo.TELA_PROJETOS
  },
  {
    id: 'clientes',
    name: 'Clientes',
    url: '/catec/clientes',
    icon: 'tabler-users',
    section: 'Menu',
    permission: PermissaoCodigo.TELA_CLIENTES
  },
  {
    id: 'usuarios',
    name: 'Usuários',
    url: '/catec/usuarios',
    icon: 'tabler-user',
    section: 'Menu',
    permission: PermissaoCodigo.TELA_USUARIOS
  },
  {
    id: 'grupos',
    name: 'Grupos',
    url: '/catec/grupos',
    icon: 'tabler-lock',
    section: 'Menu',
    permission: PermissaoCodigo.TELA_GRUPOS
  }
]

export default data
