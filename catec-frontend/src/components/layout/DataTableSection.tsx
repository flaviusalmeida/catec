import type { ReactNode } from "react";
import EmptyState from "../ui/EmptyState";
import "./DataTableSection.css";

export type DataTableSectionProps = {
  loading: boolean;
  loadingLabel?: string;
  /** Sem registros no cadastro (antes de qualquer linha na tabela). */
  empty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  /** Indica que filtros ainda estão “encruzilhando” (ex.: `useDeferredValue`). */
  filterPending?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Cartão da grade CRUD: carregando, vazio inicial ou tabela com scroll horizontal.
 */
export default function DataTableSection({
  loading,
  loadingLabel = "Carregando lista...",
  empty,
  emptyTitle,
  emptyDescription,
  filterPending = false,
  children,
  className,
}: DataTableSectionProps) {
  const sectionClass = ["data-table-section", className].filter(Boolean).join(" ");

  return (
    <section className={sectionClass} aria-busy={loading}>
      {loading ? (
        <div className="data-table-section__loading">
          <div className="data-table-section__spinner" aria-hidden />
          <p className="data-table-section__loading-text">{loadingLabel}</p>
        </div>
      ) : empty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} variant="standalone" />
      ) : (
        <div
          className={
            filterPending
              ? "data-table-section__wrap data-table-section__wrap--filter-pending"
              : "data-table-section__wrap"
          }
        >
          {children}
        </div>
      )}
    </section>
  );
}
