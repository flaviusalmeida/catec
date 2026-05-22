import type { ButtonHTMLAttributes, ReactNode } from "react";
import "../table/RowEditButton.css";

export type TableActionVariant = "edit" | "view" | "download" | "delete";

const LABELS: Record<TableActionVariant, string> = {
  edit: "Editar",
  view: "Visualizar",
  download: "Baixar",
  delete: "Excluir",
};

function ActionIcon({ variant }: { variant: TableActionVariant }) {
  if (variant === "view") {
    return (
      <svg className="row-edit-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (variant === "download") {
    return (
      <svg className="row-edit-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v12M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === "delete") {
    return (
      <svg className="row-edit-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="row-edit-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type TableActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & {
  variant?: TableActionVariant;
  ariaLabel: string;
  label?: string;
  icon?: ReactNode;
  stopRowClick?: boolean;
};

/** Ação padronizada na coluna de ações da tabela. */
export default function TableAction({
  variant = "edit",
  ariaLabel,
  label,
  icon,
  stopRowClick = true,
  onClick,
  className,
  ...rest
}: TableActionProps) {
  const classes = ["row-edit-button", className].filter(Boolean).join(" ");
  const visibleLabel = label ?? LABELS[variant];

  return (
    <button
      type="button"
      {...rest}
      className={classes}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (stopRowClick) {
          e.stopPropagation();
        }
        onClick?.(e);
      }}
    >
      {icon ?? <ActionIcon variant={variant} />}
      <span>{visibleLabel}</span>
    </button>
  );
}
