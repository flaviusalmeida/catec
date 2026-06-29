'use client'

import { useCallback, useEffect, useState } from 'react'

import { catecClientesDb } from '@/fake-db/catec/clientes'
import type { CatecCliente } from '@/types/catec/clienteTypes'

const STORAGE_KEY = 'catec-clientes-mock'

function readStorage(): CatecCliente[] {
  if (typeof window === 'undefined') return [...catecClientesDb]

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (raw) return JSON.parse(raw) as CatecCliente[]
  } catch {
    /* ignore */
  }

  return [...catecClientesDb]
}

export function useClientesStore() {
  const [lista, setLista] = useState<CatecCliente[]>(readStorage)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLista(readStorage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
  }, [lista, hydrated])

  const updateCliente = useCallback((id: number, patch: Partial<CatecCliente>) => {
    setLista(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const addCliente = useCallback((cliente: CatecCliente) => {
    setLista(prev => [...prev, cliente])
  }, [])

  const removeCliente = useCallback((id: number) => {
    setLista(prev => prev.filter(c => c.id !== id))
  }, [])

  return { lista, setLista, updateCliente, addCliente, removeCliente, hydrated }
}
