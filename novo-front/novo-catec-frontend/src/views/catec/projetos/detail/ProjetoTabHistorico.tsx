'use client'

import { useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import TablePagination from '@mui/material/TablePagination'

import { metaHistoricoItem, rotuloHistoricoItem } from '../projetoFluxoHelpers'
import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoStateCard from './ProjetoStateCard'
import ProjetoTimeline from './ProjetoTimeline'

type Props = {
  fluxo: UseProjetoFluxoStore
}

const PAGE_SIZE = 5

const ProjetoTabHistorico = ({ fluxo }: Props) => {
  const { data } = fluxo
  const [page, setPage] = useState(0)

  const itensOrdenados = useMemo(
    () => [...data.historico].sort((a, b) => b.ocorridoEm.localeCompare(a.ocorridoEm)),
    [data.historico]
  )

  const pagina = useMemo(() => {
    const start = page * PAGE_SIZE

    return itensOrdenados.slice(start, start + PAGE_SIZE)
  }, [itensOrdenados, page])

  const timeline = pagina.map(item => ({
    key: `${item.origem}-${item.registroId}`,
    titulo: rotuloHistoricoItem(item),
    meta: metaHistoricoItem(item),
    texto: item.texto
  }))

  if (itensOrdenados.length === 0) {
    return <ProjetoStateCard titulo='Nenhum histórico disponível.' />
  }

  return (
    <Card>
      <CardHeader title='Histórico do fluxo' />
      <CardContent>
        <ProjetoTimeline items={timeline} />
        <TablePagination
          component='div'
          count={itensOrdenados.length}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </CardContent>
    </Card>
  )
}

export default ProjetoTabHistorico
