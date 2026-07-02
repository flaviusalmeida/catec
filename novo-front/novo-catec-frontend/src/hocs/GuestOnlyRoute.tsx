// Next Imports
import { redirect } from 'next/navigation'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Lib Imports
import { getAuthSession } from '@/libs/auth'

// Util Imports
import { getPostAuthDestination } from '@/utils/catec/authPaths'

const GuestOnlyRoute = async ({ children, lang }: ChildrenType & { lang: Locale }) => {
  const session = await getAuthSession()

  if (session) {
    redirect(getPostAuthDestination(session, lang))
  }

  return <>{children}</>
}

export default GuestOnlyRoute
