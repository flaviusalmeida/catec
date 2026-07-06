'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import { obterProjetosPainelCatec } from '@/libs/catecProjetosApi'
import type { CatecProjetoPainel } from '@/types/catec/projetoTypes'

type StoreState = {
  painel: CatecProjetoPainel | null
  carregando: boolean
  erro: string | null
  inicializado: boolean
}

const initialState: StoreState = { painel: null, carregando: false, erro: null, inicializado: false }

let state: StoreState = { ...initialState }
const listeners = new Set<() => void>()
let carregarPromise: Promise<void> | null = null

function emit() {
  for (const listener of listeners) listener()
}

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

async function carregarStore() {
  if (carregarPromise) return carregarPromise

  carregarPromise = (async () => {
    setState({ carregando: true, erro: null })

    try {
      const painel = await obterProjetosPainelCatec()

      setState({ painel, carregando: false, erro: null, inicializado: true })
    } catch (err) {
      setState({
        painel: null,
        carregando: false,
        erro: err instanceof Error ? err.message : 'Não foi possível carregar o painel.',
        inicializado: true
      })
    } finally {
      carregarPromise = null
    }
  })()

  return carregarPromise
}

export function usePainelStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!snapshot.inicializado && !snapshot.carregando) {
      void carregarStore()
    }
  }, [snapshot.inicializado, snapshot.carregando])

  const carregar = useCallback(async () => {
    await carregarStore()
  }, [])

  return {
    painel: snapshot.painel,
    carregando: snapshot.carregando,
    erro: snapshot.erro,
    carregar
  }
}
