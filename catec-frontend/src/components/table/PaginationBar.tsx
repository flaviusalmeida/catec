import GhostButton from "../buttons/GhostButton";
import "./PaginationBar.css";

export type PaginationBarProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Barra de paginação reutilizável (API `PageResponse`).
 */
export default function PaginationBar({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  disabled = false,
  className,
}: PaginationBarProps) {
  const rootClass = ["pagination-bar", className].filter(Boolean).join(" ");
  const inicio = totalElements === 0 ? 0 : page * pageSize + 1;
  const fim = Math.min((page + 1) * pageSize, totalElements);
  const podeAnterior = page > 0 && !disabled;
  const podeProxima = page + 1 < totalPages && !disabled;

  return (
    <nav className={rootClass} aria-label="Paginação">
      <p className="pagination-bar__info">
        {totalElements === 0
          ? "Nenhum registro"
          : `${inicio}–${fim} de ${totalElements}`}
        {totalPages > 1 ? ` · Página ${page + 1} de ${totalPages}` : null}
      </p>
      <div className="pagination-bar__actions">
        <GhostButton disabled={!podeAnterior} onClick={() => onPageChange(page - 1)}>
          Anterior
        </GhostButton>
        <GhostButton disabled={!podeProxima} onClick={() => onPageChange(page + 1)}>
          Próxima
        </GhostButton>
      </div>
    </nav>
  );
}
