import { redirect } from 'next/navigation'

import type { Locale } from '@configs/i18n'
import { i18n } from '@configs/i18n'

import { getCatecLoginUrl } from '@/utils/catec/authPaths'

type Props = {
  params: Promise<{ lang: string }>
}

const CatecLoginRedirectPage = async ({ params }: Props) => {
  const { lang } = await params
  const locale: Locale = i18n.locales.includes(lang as Locale) ? (lang as Locale) : i18n.defaultLocale

  redirect(getCatecLoginUrl(locale))
}

export default CatecLoginRedirectPage
