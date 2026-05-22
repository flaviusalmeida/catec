import type { MouseEvent, ReactNode } from "react";
import "./data-table.css";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  /** Rótulo no modo card (mobile). */
  dataLabel: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, rowIndex: number) => ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T, event: MouseEvent<HTMLTableRowElement>) => void;
  /** Mensagem quando há dados no cadastro mas o filtro não retorna linhas. */
  filterEmptyMessage?: string;
  /** Modificador de larguras de coluna por entidade (ex.: `data-table--clientes`). */
  tableClassName?: string;
  renderActions?: (row: T) => ReactNode;
  actionsHeader?: string;
};

export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  onRowDoubleClick,
  filterEmptyMessage = "Não há registros que correspondam aos filtros.",
  tableClassName,
  renderActions,
  actionsHeader = "Ações",
}: DataTableProps<T>) {
  const tableClass = ["data-table", tableClassName].filter(Boolean).join(" ");
  const colSpan = columns.length + (renderActions ? 1 : 0);
  const hasFilterEmpty = rows.length === 0;

  return (
    <table className={tableClass}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.id} scope="col" className={col.headerClassName}>
              {col.header}
            </th>
          ))}
          {renderActions ? (
            <th scope="col" className="data-table__th-actions">
              {actionsHeader}
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {hasFilterEmpty ? (
          <tr className="data-table__empty-row">
            <td colSpan={colSpan}>
              <p className="data-table__filter-msg" role="status">
                {filterEmptyMessage}
              </p>
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => (
            <tr
              key={getRowKey(row)}
              className={`data-table__row${idx % 2 === 1 ? " data-table__row--alt" : ""}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onDoubleClick={
                onRowDoubleClick
                  ? (e) => {
                      onRowDoubleClick(row, e);
                    }
                  : undefined
              }
            >
              {columns.map((col) => (
                <td
                  key={col.id}
                  className={col.cellClassName}
                  data-label={col.dataLabel}
                >
                  {col.render(row, idx)}
                </td>
              ))}
              {renderActions ? (
                <td className="data-table__td-actions" data-label={actionsHeader}>
                  {renderActions(row)}
                </td>
              ) : null}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
