'use client'

// Component Imports
import CanPermission from '@/components/catec/CanPermission'
import { MenuItem } from '@menu/vertical-menu'

// Type Imports
import { PermissaoCodigo } from '@/types/catec/permissao'

type Props = {
  withIcons?: boolean
}

const CatecNavMenuItems = ({ withIcons = false }: Props) => {
  const icon = (className: string) => (withIcons ? <i className={className} /> : undefined)

  return (
    <>
      <CanPermission code={PermissaoCodigo.TELA_PROJETOS}>
        <MenuItem href='/catec/projetos' icon={icon('tabler-briefcase')}>
          Projetos
        </MenuItem>
      </CanPermission>
      <CanPermission code={PermissaoCodigo.TELA_CLIENTES}>
        <MenuItem href='/catec/clientes' icon={icon('tabler-user')}>
          Clientes
        </MenuItem>
      </CanPermission>
      <CanPermission code={PermissaoCodigo.TELA_USUARIOS}>
        <MenuItem href='/catec/usuarios' icon={icon('tabler-user')}>
          Usuários
        </MenuItem>
      </CanPermission>
      <CanPermission code={PermissaoCodigo.TELA_GRUPOS}>
        <MenuItem href='/catec/grupos' icon={icon('tabler-lock')}>
          Grupos
        </MenuItem>
      </CanPermission>
    </>
  )
}

export default CatecNavMenuItems
