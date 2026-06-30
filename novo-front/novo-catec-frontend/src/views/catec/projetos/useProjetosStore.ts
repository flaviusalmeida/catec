'use client'

import { useCallback, useEffect, useState } from 'react'

import { catecProjetosDb } from '@/fake-db/catec/projetos'
import type { CatecProjeto } from '@/types/catec/projetoTypes'

const STORAGE_KEY = 'catec-projetos-mock'

function readStorage(): CatecProjeto[] {
  if (typeof window === 'undefined') return [...catecProjetosDb]

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (raw) return JSON.parse(raw) as CatecProjeto[]
  } catch {
    /* ignore */
  }

  return [...catecProjetosDb]
}

export function useProjetosStore() {
  const [lista, setLista] = useState<CatecProjeto[]>(readStorage)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLista(readStorage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
  }, [lista, hydrated])

  const addProjeto = useCallback((projeto: CatecProjeto) => {
    setLista(prev => [...prev, projeto])
  }, [])

  const updateProjeto = useCallback((id: number, patch: Partial<CatecProjeto>) => {
    setLista(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              ...patch,
              atualizadoEm: new Date().toISOString()
            }
          : p
      )
    )
  }, [])

  return { lista, addProjeto, updateProjeto, hydrated }
}
