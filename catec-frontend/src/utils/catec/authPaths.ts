import type { Session } from 'next-auth'

import themeConfig from '@configs/themeConfig'

export const CATEC_LOGIN_PATH = '/login'
export const CATEC_DEFINIR_SENHA_PATH = '/catec/definir-senha'

export function needsTrocaSenha(session: Session | null): boolean {
  return session?.user?.requerTrocaSenha === true || session?.user?.trocaSenhaObrigatoria === true
}

export function getCatecLoginUrl(redirectTo?: string): string {
  if (!redirectTo) {
    return CATEC_LOGIN_PATH
  }

  return `${CATEC_LOGIN_PATH}?redirectTo=${encodeURIComponent(redirectTo)}`
}

export function getCatecDefinirSenhaUrl(): string {
  return CATEC_DEFINIR_SENHA_PATH
}

export function getCatecHomeUrl(): string {
  return themeConfig.homePageUrl
}

export function getPostAuthDestination(session: Session, redirectTo?: string | null): string {
  if (needsTrocaSenha(session)) {
    return getCatecDefinirSenhaUrl()
  }

  if (redirectTo) {
    return redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`
  }

  return getCatecHomeUrl()
}
