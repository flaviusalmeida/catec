'use client'

import { useCallback, useEffect, useState } from 'react'

import { catecUsuariosDb } from '@/fake-db/catec/usuarios'
import type { CatecAdminUsuario } from '@/types/catec/usuarioTypes'

const STORAGE_KEY = 'catec-usuarios-mock'

function readStorage(): CatecAdminUsuario[] {
  if (typeof window === 'undefined') return [...catecUsuariosDb]

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (raw) return JSON.parse(raw) as CatecAdminUsuario[]
  } catch {
    /* ignore */
  }

  return [...catecUsuariosDb]
}

export function useUsuarios2Store() {
  const [lista, setLista] = useState<CatecAdminUsuario[]>(readStorage)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLista(readStorage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
  }, [lista, hydrated])

  const updateUsuario = useCallback((id: number, patch: Partial<CatecAdminUsuario>) => {
    setLista(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)))
  }, [])

  const addUsuario = useCallback((usuario: CatecAdminUsuario) => {
    setLista(prev => [...prev, usuario])
  }, [])

  const removeUsuario = useCallback((id: number) => {
    setLista(prev => prev.filter(u => u.id !== id))
  }, [])

  return { lista, setLista, updateUsuario, addUsuario, removeUsuario, hydrated }
}
