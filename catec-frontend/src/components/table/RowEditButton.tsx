import type { ButtonHTMLAttributes } from "react";
import "./RowEditButton.css";

export type RowEditButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & {
  /** Rótulo acessível, ex.: `Editar Empresa XYZ` */
  ariaLabel: string;
  /** Texto visível ao lado do ícone; padrão `Editar` */
  label?: string;
  /** Quando a linha da tabela também abre o registro, evita disparar o clique da linha (padrão: true) */
  stopRowClick?: boolean;
};

export default function RowEditButton({
  ariaLabel,
  label = "Editar",
  stopRowClick = true,
  onClick,
  className,
  ...rest
}: RowEditButtonProps) {
  const classes = ["row-edit-button", className].filter(Boolean).join(" ");

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
      <span>{label}</span>
    </button>
  );
}
