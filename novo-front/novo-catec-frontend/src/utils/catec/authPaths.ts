import type { Session } from 'next-auth'

import type { Locale } from '@configs/i18n'
import themeConfig from '@configs/themeConfig'

import { getLocalizedUrl } from '@/utils/i18n'

export const CATEC_LOGIN_PATH = '/login'
export const CATEC_DEFINIR_SENHA_PATH = '/catec/definir-senha'

export function needsTrocaSenha(session: Session | null): boolean {
  return session?.user?.requerTrocaSenha === true || session?.user?.trocaSenhaObrigatoria === true
}

export function getCatecLoginUrl(locale: Locale, redirectTo?: string): string {
  const login = getLocalizedUrl(CATEC_LOGIN_PATH, locale)

  if (!redirectTo) {
    return login
  }

  return `${login}?redirectTo=${encodeURIComponent(redirectTo)}`
}

export function getCatecDefinirSenhaUrl(locale: Locale): string {
  return getLocalizedUrl(CATEC_DEFINIR_SENHA_PATH, locale)
}

export function getCatecHomeUrl(locale: Locale): string {
  return getLocalizedUrl(themeConfig.homePageUrl, locale)
}

export function getPostAuthDestination(
  session: Session,
  locale: Locale,
  redirectTo?: string | null
): string {
  if (needsTrocaSenha(session)) {
    return getCatecDefinirSenhaUrl(locale)
  }

  if (redirectTo) {
    return getLocalizedUrl(redirectTo, locale)
  }

  return getCatecHomeUrl(locale)
}
