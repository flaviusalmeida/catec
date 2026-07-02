'use client'

// Next Imports
import { useParams } from 'next/navigation'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'

// Component Imports
import CanPermission from '@/components/catec/CanPermission'
import { MenuItem } from '@menu/vertical-menu'

// Type Imports
import { PermissaoCodigo } from '@/types/catec/permissao'

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  withIcons?: boolean
}

const CatecNavMenuItems = ({ dictionary, withIcons = false }: Props) => {
  const params = useParams()
  const locale = params.lang

  const icon = (className: string) => (withIcons ? <i className={className} /> : undefined)

  return (
    <>
      <CanPermission code={PermissaoCodigo.TELA_PROJETOS}>
        <MenuItem href={`/${locale}/catec/projetos`} icon={icon('tabler-briefcase')}>
          {dictionary['navigation'].projetos}
        </MenuItem>
      </CanPermission>
      <CanPermission code={PermissaoCodigo.TELA_CLIENTES}>
        <MenuItem href={`/${locale}/catec/clientes`} icon={icon('tabler-user')}>
          {dictionary['navigation'].clientes}
        </MenuItem>
      </CanPermission>
      <CanPermission code={PermissaoCodigo.TELA_USUARIOS}>
        <MenuItem href={`/${locale}/catec/usuarios`} icon={icon('tabler-user')}>
          {dictionary['navigation'].usuarios}
        </MenuItem>
      </CanPermission>
      <CanPermission code={PermissaoCodigo.TELA_GRUPOS}>
        <MenuItem href={`/${locale}/catec/grupos`} icon={icon('tabler-lock')}>
          {dictionary['navigation'].grupos}
        </MenuItem>
      </CanPermission>
    </>
  )
}

export default CatecNavMenuItems
