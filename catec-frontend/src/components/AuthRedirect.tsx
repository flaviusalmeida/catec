'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getCatecLoginUrl } from '@/utils/catec/authPaths'

const AuthRedirect = ({ lang }: { lang: Locale }) => {
  const pathname = usePathname()

  redirect(getCatecLoginUrl(lang, pathname))
}

export default AuthRedirect
