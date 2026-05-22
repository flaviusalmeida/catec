import "./LoadingSkeleton.css";

export type LoadingSkeletonProps = {
  /** Quantidade de linhas simuladas na tabela. */
  rows?: number;
  /** Quantidade de campos simulados nos filtros. */
  filterFields?: number;
  className?: string;
};

/** Skeleton padrão para telas de listagem (filtros + tabela). */
export default function LoadingSkeleton({ rows = 6, filterFields = 4, className }: LoadingSkeletonProps) {
  const rootClass = ["list-page-skeleton", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} aria-hidden>
      <div className="list-page-skeleton__filters">
        <div className="list-page-skeleton__filters-head" />
        <div className="list-page-skeleton__filters-grid">
          {Array.from({ length: filterFields }, (_, i) => (
            <div key={i} className="list-page-skeleton__filter-field" />
          ))}
        </div>
      </div>
      <div className="list-page-skeleton__table">
        <div className="list-page-skeleton__table-head" />
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="list-page-skeleton__table-row" />
        ))}
      </div>
    </div>
  );
}
