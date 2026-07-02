'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Util Imports
import { getCatecLoginUrl } from '@/utils/catec/authPaths'

const AuthRedirect = () => {
  const pathname = usePathname()

  redirect(getCatecLoginUrl(pathname))
}

export default AuthRedirect
