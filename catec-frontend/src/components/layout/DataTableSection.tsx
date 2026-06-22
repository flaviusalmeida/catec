import type { ReactNode } from "react";
import LoadingSkeleton from "../list-page/LoadingSkeleton";
import EmptyState from "../ui/EmptyState";
import LoadingBlock from "../ui/LoadingBlock";
import "./DataTableSection.css";

export type DataTableSectionProps = {
  loading: boolean;
  loadingLabel?: string;
  /** Sem registros no cadastro (antes de qualquer linha na tabela). */
  empty: boolean;
  emptyMessage: string;
  /** Indica que os filtros ainda acompanham a digitação (ex.: `useDeferredValue`). */
  filterPending?: boolean;
  /** Usa skeleton do design system em vez do spinner. */
  useSkeleton?: boolean;
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
  emptyMessage,
  filterPending = false,
  useSkeleton = false,
  children,
  className,
}: DataTableSectionProps) {
  const sectionClass = ["data-table-section", className].filter(Boolean).join(" ");

  return (
    <section className={sectionClass} aria-busy={loading}>
      {loading ? (
        useSkeleton ? (
          <LoadingSkeleton />
        ) : (
          <LoadingBlock label={loadingLabel} />
        )
      ) : empty ? (
        <EmptyState message={emptyMessage} />
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
