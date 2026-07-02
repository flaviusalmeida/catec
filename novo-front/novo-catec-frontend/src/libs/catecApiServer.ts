import { CATEC_API_BASE_URL } from '@/libs/catecConfig'
import type { CatecLoginRequest, CatecMeUser } from '@/types/catec/authTypes'
import { parseCatecMeUser } from '@/types/catec/authTypes'

function resolveUrl(path: string): string {
  return path.startsWith('http') ? path : `${CATEC_API_BASE_URL}${path}`
}

export async function catecApiFetchServer(
  path: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (init.body != null && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  headers.set('Authorization', `Bearer ${accessToken}`)

  return fetch(resolveUrl(path), { ...init, headers })
}

/** Login público — usado pelo NextAuth `authorize` (Fase 4B-05). */
export async function postCatecLogin(body: CatecLoginRequest): Promise<Response> {
  return fetch(resolveUrl('/api/v1/auth/login'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

export async function fetchCatecMe(accessToken: string): Promise<CatecMeUser> {
  const res = await catecApiFetchServer('/api/v1/me', accessToken)

  if (!res.ok) {
    throw new Error('Não foi possível carregar o perfil do usuário.')
  }

  return parseCatecMeUser(await res.json())
}
