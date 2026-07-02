// Third-party Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

// Lib Imports
import { getAuthSession } from '@/libs/auth'

export default async function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const session = await getAuthSession()

  return <>{session ? children : <AuthRedirect lang={locale} />}</>
}
