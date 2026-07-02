// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'
import { i18n } from '@configs/i18n'

// HOC Imports
import RequireTrocaSenhaRoute from '@/hocs/RequireTrocaSenhaRoute'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: string }> }) => {
  const params = await props.params
  const { children } = props

  const lang: Locale = i18n.locales.includes(params.lang as Locale) ? (params.lang as Locale) : i18n.defaultLocale

  return <RequireTrocaSenhaRoute lang={lang}>{children}</RequireTrocaSenhaRoute>
}

export default Layout
