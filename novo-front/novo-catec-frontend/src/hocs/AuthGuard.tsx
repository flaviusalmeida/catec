// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

// Lib Imports
import { getAuthSession } from '@/libs/auth'

// Util Imports
import { getCatecDefinirSenhaUrl, needsTrocaSenha } from '@/utils/catec/authPaths'

export default async function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const session = await getAuthSession()

  if (!session) {
    return <AuthRedirect lang={locale} />
  }

  if (needsTrocaSenha(session)) {
    redirect(getCatecDefinirSenhaUrl(locale))
  }

  return <>{children}</>
}
