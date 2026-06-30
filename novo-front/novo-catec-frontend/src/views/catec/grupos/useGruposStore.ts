'use client'

import { useCallback, useEffect, useState } from 'react'

import { catecGruposDb } from '@/fake-db/catec/grupos'
import type { CatecGrupo } from '@/types/catec/grupoTypes'

const STORAGE_KEY = 'catec-grupos-mock'

function readStorage(): CatecGrupo[] {
  if (typeof window === 'undefined') return [...catecGruposDb]

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (raw) return JSON.parse(raw) as CatecGrupo[]
  } catch {
    /* ignore */
  }

  return [...catecGruposDb]
}

export function useGruposStore() {
  const [lista, setLista] = useState<CatecGrupo[]>(readStorage)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLista(readStorage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
  }, [lista, hydrated])

  const addGrupo = useCallback((grupo: CatecGrupo) => {
    setLista(prev => [...prev, grupo])
  }, [])

  const updateGrupo = useCallback((id: number, patch: Partial<CatecGrupo>) => {
    setLista(prev =>
      prev.map(g =>
        g.id === id
          ? {
              ...g,
              ...patch,
              atualizadoEm: new Date().toISOString()
            }
          : g
      )
    )
  }, [])

  const removeGrupo = useCallback((id: number) => {
    setLista(prev => prev.filter(g => g.id !== id))
  }, [])

  return { lista, addGrupo, updateGrupo, removeGrupo, hydrated }
}
