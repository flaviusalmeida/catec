'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  acaoPropostaCatec,
  carregarContratoComDocumentosCatec,
  carregarPropostasComDocumentosCatec,
  enviarContratoClienteCatec,
  listarHistoricoProjetoCatec,
  registrarInteracaoContratoCatec,
  registrarInteracaoPropostaCatec,
  uploadDocumentoContratoCatec,
  uploadDocumentoPropostaCatec
} from '@/libs/catecProjetosApi'
import type {
  CatecHistoricoPage,
  CatecProjetoFluxoData,
  CatecPropostaWorkflowActionKey,
  CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'
import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_PROPOSTA_RESPOSTA_CLIENTE
} from '@/types/catec/projetoFluxoTypes'

import {
  computeProjetoFluxoResumo,
  propostaMaisRecente
} from './projetoFluxoHelpers'

const HISTORICO_SIZE = 20

const emptyData: CatecProjetoFluxoData = {
  propostas: [],
  contrato: null,
  interacoes: [],
  historico: []
}

export function useProjetoFluxoStore(projetoId: number, onAfterMutation?: () => Promise<void>) {
  const [data, setData] = useState<CatecProjetoFluxoData>(emptyData)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)

  const [historicoPage, setHistoricoPage] = useState<CatecHistoricoPage>({
    content: [],
    page: 0,
    size: HISTORICO_SIZE,
    totalElements: 0,
    totalPages: 0
  })

  const [historicoCarregando, setHistoricoCarregando] = useState(false)

  const recarregar = useCallback(async () => {
    if (!Number.isFinite(projetoId) || projetoId < 1) {
      setErro('Projeto inválido.')
      setCarregando(false)

      return
    }

    setCarregando(true)
    setErro(null)

    try {
      const [propostas, contrato] = await Promise.all([
        carregarPropostasComDocumentosCatec(projetoId),
        carregarContratoComDocumentosCatec(projetoId)
      ])

      setData({ propostas, contrato, interacoes: [], historico: [] })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao carregar dados do projeto.')
      setData(emptyData)
    } finally {
      setCarregando(false)
    }
  }, [projetoId])

  const carregarHistorico = useCallback(
    async (page: number) => {
      setHistoricoCarregando(true)

      try {
        const result = await listarHistoricoProjetoCatec(projetoId, page, HISTORICO_SIZE)

        setHistoricoPage(result)
        setData(prev => ({ ...prev, historico: result.content }))
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Falha ao carregar histórico.')
      } finally {
        setHistoricoCarregando(false)
      }
    },
    [projetoId]
  )

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  const resumo = useMemo(() => computeProjetoFluxoResumo(projetoId, data), [projetoId, data])
  const propostaAtual = useMemo(() => propostaMaisRecente(data.propostas), [data.propostas])

  const notificarMutacao = useCallback(async () => {
    if (onAfterMutation) {
      await onAfterMutation()
    }
  }, [onAfterMutation])

  const uploadProposta = useCallback(
    async (file: File) => {
      setProcessando(true)

      try {
        await uploadDocumentoPropostaCatec(projetoId, propostaAtual?.id ?? null, file)
        await recarregar()
        await notificarMutacao()
      } finally {
        setProcessando(false)
      }
    },
    [projetoId, propostaAtual?.id, recarregar, notificarMutacao]
  )

  const acaoProposta = useCallback(
    async (acao: CatecPropostaWorkflowActionKey, observacao?: string) => {
      if (!propostaAtual) return

      setProcessando(true)

      try {
        await acaoPropostaCatec(projetoId, propostaAtual.id, acao, { observacao })
        await recarregar()
        await notificarMutacao()
      } finally {
        setProcessando(false)
      }
    },
    [projetoId, propostaAtual, recarregar, notificarMutacao]
  )

  const uploadContrato = useCallback(
    async (file: File) => {
      setProcessando(true)

      try {
        await uploadDocumentoContratoCatec(projetoId, data.contrato?.id ?? null, file)
        await recarregar()
        await notificarMutacao()
      } finally {
        setProcessando(false)
      }
    },
    [projetoId, data.contrato?.id, recarregar, notificarMutacao]
  )

  const enviarContratoCliente = useCallback(async () => {
    if (!data.contrato) return

    setProcessando(true)

    try {
      await enviarContratoClienteCatec(projetoId, data.contrato.id)
      await recarregar()
      await notificarMutacao()
    } finally {
      setProcessando(false)
    }
  }, [projetoId, data.contrato, recarregar, notificarMutacao])

  const registrarInteracao = useCallback(
    async (tipo: CatecTipoInteracaoFluxo, texto: string) => {
      const cont = data.contrato && STATUS_CONTRATO_INTERACAO_CLIENTE.includes(data.contrato.status)
        ? data.contrato
        : null

      const prop = data.propostas.find(p => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null

      if (!cont && !prop) return

      setProcessando(true)

      try {
        if (cont) {
          await registrarInteracaoContratoCatec(projetoId, cont.id, tipo, texto)
        } else if (prop) {
          await registrarInteracaoPropostaCatec(projetoId, prop.id, tipo, texto)
        }

        await recarregar()
        await notificarMutacao()
      } finally {
        setProcessando(false)
      }
    },
    [data.contrato, data.propostas, projetoId, recarregar, notificarMutacao]
  )

  return {
    data,
    resumo,
    propostaAtual,
    carregando,
    erro,
    processando,
    historicoPage,
    historicoCarregando,
    recarregar,
    carregarHistorico,
    uploadProposta,
    acaoProposta,
    uploadContrato,
    enviarContratoCliente,
    registrarInteracao
  }
}

export type UseProjetoFluxoStore = ReturnType<typeof useProjetoFluxoStore>
