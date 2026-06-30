'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  computeProjetoFluxoResumo,
  getInitialProjetoFluxoData,
  propostaMaisRecente
} from '@/fake-db/catec/projetoFluxo'
import type {
  CatecHistoricoFluxoItem,
  CatecInteracaoTimelineItem,
  CatecProjetoFluxoData,
  CatecProjetoFluxoResumo,
  CatecPropostaWorkflowActionKey,
  CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'
import {
  STATUS_CONTRATO_INTERACAO_CLIENTE,
  STATUS_PROPOSTA_RESPOSTA_CLIENTE,
  TIPO_INTERACAO_ROTULO_CONTRATO,
  TIPO_INTERACAO_ROTULO_PROPOSTA
} from '@/types/catec/projetoFluxoTypes'

import { formatarDataHora } from './projetoFluxoHelpers'

function storageKey(projetoId: number) {
  return `catec-projeto-fluxo-${projetoId}`
}

function readStorage(projetoId: number): CatecProjetoFluxoData {
  if (typeof window === 'undefined') return getInitialProjetoFluxoData(projetoId)

  try {
    const raw = sessionStorage.getItem(storageKey(projetoId))

    if (raw) return JSON.parse(raw) as CatecProjetoFluxoData
  } catch {
    /* ignore */
  }

  return getInitialProjetoFluxoData(projetoId)
}

function pushHistorico(data: CatecProjetoFluxoData, item: CatecHistoricoFluxoItem) {
  data.historico.unshift(item)
}

function interacaoTimeline(
  key: string,
  titulo: string,
  usuario: string,
  texto: string,
  criadoEm: string,
  origem: 'PROPOSTA' | 'CONTRATO'
): CatecInteracaoTimelineItem {
  return {
    key,
    titulo,
    meta: `${usuario} · ${formatarDataHora(criadoEm)}`,
    texto,
    criadoEm,
    origem
  }
}

export function useProjetoFluxoStore(projetoId: number) {
  const [data, setData] = useState<CatecProjetoFluxoData>(() => readStorage(projetoId))
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setData(readStorage(projetoId))
    setHydrated(true)
  }, [projetoId])

  useEffect(() => {
    if (!hydrated) return

    sessionStorage.setItem(storageKey(projetoId), JSON.stringify(data))
  }, [data, hydrated, projetoId])

  const resumo: CatecProjetoFluxoResumo = useMemo(
    () => computeProjetoFluxoResumo(projetoId, data),
    [projetoId, data]
  )

  const propostaAtual = useMemo(() => propostaMaisRecente(data.propostas), [data.propostas])

  const uploadProposta = useCallback(
    (nomeArquivo: string) => {
      setData(prev => {
        const next = structuredClone(prev)
        const agora = new Date().toISOString()
        let proposta = propostaMaisRecente(next.propostas)

        if (!proposta || (proposta.status !== 'RASCUNHO' && proposta.status !== 'AGUARDANDO_AJUSTE')) {
          const novaVersao = (proposta?.versao ?? 0) + 1
          const novoId = Date.now()

          proposta = {
            id: novoId,
            projetoId,
            status: 'RASCUNHO',
            versao: novaVersao,
            requerAvaliacaoSocio: false,
            elaboradoPorId: 1,
            elaboradoPorNome: 'Usuário mock',
            enviadaClienteEm: null,
            avaliadaSocioEm: null,
            consideracoesPendentes: false,
            criadoEm: agora,
            atualizadoEm: agora,
            documentos: []
          }
          next.propostas.unshift(proposta)
        }

        const docId = Date.now() + 1

        proposta.documentos = [
          {
            id: docId,
            nomeOriginal: nomeArquivo,
            versao: proposta.versao,
            uploadedPorNome: 'Usuário mock',
            criadoEm: agora
          }
        ]
        proposta.atualizadoEm = agora

        pushHistorico(next, {
          origem: 'AUDITORIA',
          registroId: docId,
          tipoEntidade: 'PROPOSTA',
          entidadeId: proposta.id,
          acao: 'DOCUMENTO_ENVIADO',
          statusAnterior: null,
          statusNovo: null,
          tipoInteracao: null,
          texto: nomeArquivo,
          usuarioNome: 'Usuário mock',
          ocorridoEm: agora
        })

        return next
      })
    },
    [projetoId]
  )

  const acaoProposta = useCallback((acao: CatecPropostaWorkflowActionKey) => {
    setData(prev => {
      const next = structuredClone(prev)
      const proposta = propostaMaisRecente(next.propostas)

      if (!proposta) return prev

      const agora = new Date().toISOString()

      switch (acao) {
        case 'enviar-cliente':
          proposta.status = 'ENVIADA_AO_CLIENTE'
          proposta.enviadaClienteEm = agora
          break
        case 'solicitar-revisao':
          proposta.status = 'PENDENTE_AVALIACAO'
          break
        case 'aprovar-socio':
          proposta.status = 'RASCUNHO'
          proposta.avaliadaSocioEm = agora
          break
        case 'reprovar-socio':
          proposta.status = 'RASCUNHO'
          proposta.avaliadaSocioEm = null
          break
      }

      proposta.atualizadoEm = agora

      pushHistorico(next, {
        origem: 'AUDITORIA',
        registroId: Date.now(),
        tipoEntidade: 'PROPOSTA',
        entidadeId: proposta.id,
        acao: 'STATUS_ALTERADO',
        statusAnterior: null,
        statusNovo: proposta.status,
        tipoInteracao: null,
        texto: null,
        usuarioNome: 'Usuário mock',
        ocorridoEm: agora
      })

      return next
    })
  }, [])

  const uploadContrato = useCallback(
    (nomeArquivo: string) => {
      setData(prev => {
        const next = structuredClone(prev)
        const agora = new Date().toISOString()

        if (!next.contrato) {
          next.contrato = {
            id: Date.now(),
            projetoId,
            status: 'RASCUNHO',
            elaboradoPorId: 1,
            elaboradoPorNome: 'Usuário mock',
            enviadoClienteEm: null,
            criadoEm: agora,
            atualizadoEm: agora,
            documentos: []
          }
        }

        const docId = Date.now() + 1

        next.contrato.documentos = [
          {
            id: docId,
            nomeOriginal: nomeArquivo,
            versao: 1,
            uploadedPorNome: 'Usuário mock',
            criadoEm: agora
          }
        ]
        next.contrato.atualizadoEm = agora

        pushHistorico(next, {
          origem: 'AUDITORIA',
          registroId: docId,
          tipoEntidade: 'CONTRATO',
          entidadeId: next.contrato.id,
          acao: 'DOCUMENTO_ENVIADO',
          statusAnterior: null,
          statusNovo: null,
          tipoInteracao: null,
          texto: nomeArquivo,
          usuarioNome: 'Usuário mock',
          ocorridoEm: agora
        })

        return next
      })
    },
    [projetoId]
  )

  const enviarContratoCliente = useCallback(() => {
    setData(prev => {
      if (!prev.contrato || prev.contrato.documentos.length === 0) return prev

      const next = structuredClone(prev)
      const agora = new Date().toISOString()

      next.contrato!.status = 'ENVIADO_AO_CLIENTE'
      next.contrato!.enviadoClienteEm = agora
      next.contrato!.atualizadoEm = agora

      pushHistorico(next, {
        origem: 'AUDITORIA',
        registroId: Date.now(),
        tipoEntidade: 'CONTRATO',
        entidadeId: next.contrato!.id,
        acao: 'STATUS_ALTERADO',
        statusAnterior: 'RASCUNHO',
        statusNovo: 'ENVIADO_AO_CLIENTE',
        tipoInteracao: null,
        texto: null,
        usuarioNome: 'Usuário mock',
        ocorridoEm: agora
      })

      return next
    })
  }, [])

  const registrarInteracao = useCallback(
    (tipo: CatecTipoInteracaoFluxo, texto: string, registradoPor = 'Usuário mock') => {
      setData(prev => {
        const prop =
          prev.propostas.find(p => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null
        const cont =
          prev.contrato && STATUS_CONTRATO_INTERACAO_CLIENTE.includes(prev.contrato.status)
            ? prev.contrato
            : null

        if (!prop && !cont) return prev

        const next = structuredClone(prev)
        const agora = new Date().toISOString()
        const registroId = Date.now()
        const origem = cont ? 'CONTRATO' : 'PROPOSTA'
        const titulo =
          origem === 'CONTRATO'
            ? TIPO_INTERACAO_ROTULO_CONTRATO[tipo]
            : TIPO_INTERACAO_ROTULO_PROPOSTA[tipo]

        next.interacoes.unshift(
          interacaoTimeline(`I-${registroId}`, titulo, registradoPor, texto.trim(), agora, origem)
        )

        if (cont) {
          if (tipo === 'ACEITE_CLIENTE') next.contrato!.status = 'ACEITO'
          if (tipo === 'RECUSA_CLIENTE') next.contrato!.status = 'RECUSADO'
          if (tipo === 'CONSIDERACOES_CLIENTE') next.contrato!.status = 'AGUARDANDO_AJUSTE'
          next.contrato!.atualizadoEm = agora
        } else if (prop) {
          if (tipo === 'ACEITE_CLIENTE') prop.status = 'ACEITA'
          if (tipo === 'RECUSA_CLIENTE') prop.status = 'NEGADA'
          if (tipo === 'CONSIDERACOES_CLIENTE') {
            prop.status = 'AGUARDANDO_AJUSTE'
            prop.consideracoesPendentes = true
          }
          prop.atualizadoEm = agora
        }

        pushHistorico(next, {
          origem: 'INTERACAO',
          registroId,
          tipoEntidade: origem,
          entidadeId: cont?.id ?? prop!.id,
          acao: null,
          statusAnterior: null,
          statusNovo: null,
          tipoInteracao: tipo,
          texto: texto.trim(),
          usuarioNome: registradoPor,
          ocorridoEm: agora
        })

        return next
      })
    },
    []
  )

  const podeRegistrarInteracao = useMemo(() => {
    const prop = data.propostas.find(p => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status))

    if (prop) return true

    return Boolean(
      data.contrato && STATUS_CONTRATO_INTERACAO_CLIENTE.includes(data.contrato.status)
    )
  }, [data])

  return {
    data,
    resumo,
    propostaAtual,
    hydrated,
    uploadProposta,
    acaoProposta,
    uploadContrato,
    enviarContratoCliente,
    registrarInteracao,
    podeRegistrarInteracao
  }
}

export type UseProjetoFluxoStore = ReturnType<typeof useProjetoFluxoStore>
