'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import type { TextFieldProps } from '@mui/material/TextField'
import classnames from 'classnames'
import { toast } from 'react-toastify'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

import {
  aprovarPropostaSocioCatec,
  devolverPropostaSocioCatec,
  listarPropostasPendentesSocioCatec
} from '@/libs/catecSocioPropostasApi'
import { listarDocumentosPropostaCatec } from '@/libs/catecProjetosApi'
import type { CatecPropostaPendenteSocio } from '@/types/catec/socioPropostaTypes'
import { downloadDocumentoCatec } from '@/utils/catec/downloadDocumento'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

import tableStyles from '@core/styles/table.module.css'

import { formatarDataCurta } from '@/views/catec/projetos/projetoFluxoHelpers'

import SocioPropostaPreviewDrawer from './SocioPropostaPreviewDrawer'

type Row = CatecPropostaPendenteSocio & { action?: string }

type DialogMode = 'aprovar' | 'devolver' | null

const globalFilterFn: FilterFn<Row> = (row, _columnId, filterValue) => {
  const q = String(filterValue).toLowerCase()

  if (!q) return true

  return (
    row.original.projetoTitulo.toLowerCase().includes(q) ||
    (row.original.clienteNome ?? '').toLowerCase().includes(q) ||
    row.original.elaboradoPorNome.toLowerCase().includes(q)
  )
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 400,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => setValue(initialValue), [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<Row>()

type Props = {
  lista: CatecPropostaPendenteSocio[]
  onRecarregar: () => Promise<void>
}

const SocioPropostaListTable = ({ lista, onRecarregar }: Props) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [processando, setProcessando] = useState(false)
  const [previewItem, setPreviewItem] = useState<CatecPropostaPendenteSocio | null>(null)
  const [dialogItem, setDialogItem] = useState<CatecPropostaPendenteSocio | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [observacao, setObservacao] = useState('')

  const abrirPreview = useCallback((item: CatecPropostaPendenteSocio) => {
    setPreviewItem(item)
  }, [])

  const abrirDialog = useCallback((item: CatecPropostaPendenteSocio, mode: Exclude<DialogMode, null>) => {
    setDialogItem(item)
    setDialogMode(mode)
    setObservacao('')
  }, [])

  const fecharDialog = useCallback(() => {
    if (processando) return

    setDialogItem(null)
    setDialogMode(null)
    setObservacao('')
  }, [processando])

  const baixarDocumento = useCallback(async (item: CatecPropostaPendenteSocio) => {
    try {
      const docs = await listarDocumentosPropostaCatec(item.projetoId, item.propostaId)
      const doc = docs[0]

      if (!doc) {
        toast.error('Nenhum documento anexado a esta proposta.')

        return
      }

      await downloadDocumentoCatec(doc.id, doc.nomeOriginal)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download falhou.')
    }
  }, [])

  const confirmarAcao = useCallback(async () => {
    if (!dialogItem || !dialogMode) return

    if (dialogMode === 'devolver' && !observacao.trim()) {
      toast.error('Informe o parecer ao devolver a proposta.')

      return
    }

    setProcessando(true)

    try {
      if (dialogMode === 'aprovar') {
        await aprovarPropostaSocioCatec(dialogItem.propostaId, {
          projetoId: dialogItem.projetoId,
          observacao: observacao.trim() || undefined
        })
        toast.success('Proposta aprovada. O administrativo pode enviar ao cliente.')
      } else {
        await devolverPropostaSocioCatec(dialogItem.propostaId, {
          projetoId: dialogItem.projetoId,
          observacao: observacao.trim()
        })
        toast.success('Proposta devolvida para ajustes.')
      }

      setPreviewItem(prev => (prev?.propostaId === dialogItem.propostaId ? null : prev))
      fecharDialog()
      await onRecarregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível concluir a ação.')
    } finally {
      setProcessando(false)
    }
  }, [dialogItem, dialogMode, fecharDialog, observacao, onRecarregar])

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      columnHelper.accessor('projetoTitulo', {
        header: 'Projeto',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={`/catec/projetos/${row.original.projetoId}`}
            color='primary.main'
            className='font-medium hover:underline'
          >
            {row.original.projetoTitulo}
          </Typography>
        )
      }),
      columnHelper.accessor('clienteNome', {
        header: 'Cliente',
        cell: ({ getValue }) => <Typography>{getValue() ?? '—'}</Typography>
      }),
      columnHelper.accessor('versao', {
        header: 'Versão',
        cell: ({ getValue }) => <Typography>{`v${getValue()}`}</Typography>
      }),
      columnHelper.accessor('elaboradoPorNome', {
        header: 'Elaborado por',
        cell: ({ getValue }) => <Typography>{getValue()}</Typography>
      }),
      columnHelper.accessor('criadoEm', {
        header: 'Enviado em',
        cell: ({ getValue }) => <Typography>{formatarDataCurta(getValue())}</Typography>
      }),
      columnHelper.display({
        id: 'action',
        header: 'Ações',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButton
              size='small'
              title='Visualizar documento'
              onClick={() => abrirPreview(row.original)}
            >
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              title='Baixar documento'
              onClick={() => void baixarDocumento(row.original)}
            >
              <i className='tabler-download text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              title='Aprovar'
              onClick={() => abrirDialog(row.original, 'aprovar')}
            >
              <i className='tabler-check text-success' />
            </IconButton>
            <IconButton
              size='small'
              title='Devolver'
              onClick={() => abrirDialog(row.original, 'devolver')}
            >
              <i className='tabler-arrow-back-up text-error' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [abrirDialog, abrirPreview, baixarDocumento]
  )

  const table = useReactTable({
    data: lista,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <>
      <Card>
        <CardHeader title='Propostas pendentes' />
        <div className='p-6 pt-0'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Buscar por projeto, cliente ou elaborador'
            className='max-is-[400px]'
          />
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center'>
                    <Typography className='p-8' color='text.secondary'>
                      Nenhuma proposta aguardando seu parecer.
                    </Typography>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />
      </Card>

      <SocioPropostaPreviewDrawer
        item={previewItem}
        open={previewItem != null}
        onClose={() => setPreviewItem(null)}
        onAprovar={item => abrirDialog(item, 'aprovar')}
        onDevolver={item => abrirDialog(item, 'devolver')}
        processando={processando}
      />

      <Dialog open={dialogMode != null} onClose={fecharDialog} fullWidth maxWidth='sm'>
        <DialogTitle>{dialogMode === 'aprovar' ? 'Aprovar proposta' : 'Devolver proposta'}</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pbs-2'>
          {dialogItem ? (
            <Typography variant='body2' color='text.secondary'>
              {dialogItem.projetoTitulo} · v{dialogItem.versao}
            </Typography>
          ) : null}
          <CustomTextField
            fullWidth
            multiline
            minRows={3}
            label={dialogMode === 'devolver' ? 'Parecer (obrigatório)' : 'Observação (opcional)'}
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            placeholder={
              dialogMode === 'devolver'
                ? 'Descreva os ajustes necessários na proposta.'
                : 'Comentário opcional sobre a aprovação.'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={fecharDialog} disabled={processando}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color={dialogMode === 'aprovar' ? 'success' : 'error'}
            onClick={() => void confirmarAcao()}
            disabled={processando || (dialogMode === 'devolver' && !observacao.trim())}
          >
            {dialogMode === 'aprovar' ? 'Confirmar aprovação' : 'Confirmar devolução'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SocioPropostaListTable
