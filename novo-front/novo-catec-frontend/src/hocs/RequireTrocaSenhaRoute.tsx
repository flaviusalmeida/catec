// Next Imports
import { redirect } from 'next/navigation'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Lib Imports
import { getAuthSession } from '@/libs/auth'

// Util Imports
import {
  getCatecDefinirSenhaUrl,
  getCatecHomeUrl,
  getCatecLoginUrl,
  needsTrocaSenha
} from '@/utils/catec/authPaths'

const RequireTrocaSenhaRoute = async ({ children, lang }: ChildrenType & { lang: Locale }) => {
  const session = await getAuthSession()

  if (!session) {
    redirect(getCatecLoginUrl(lang, getCatecDefinirSenhaUrl(lang)))
  }

  if (!needsTrocaSenha(session)) {
    redirect(getCatecHomeUrl(lang))
  }

  return <>{children}</>
}

export default RequireTrocaSenhaRoute
