'use client'

import { getSession } from 'next-auth/react'

import { resolveCatecApiUrl } from '@/libs/catecApi'

export async function downloadDocumentoCatec(documentoId: number, nomeOriginal: string): Promise<void> {
  const session = await getSession()
  const token = session?.user?.accessToken

  const res = await fetch(resolveCatecApiUrl(`/api/v1/documentos/${documentoId}/conteudo`), {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })

  if (!res.ok) {
    throw new Error(`Download falhou (${res.status})`)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = nomeOriginal || 'documento'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
