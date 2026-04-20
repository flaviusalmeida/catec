import type { ReactNode } from "react";
import "./ModalFormGrid.css";

export type ModalFormGridProps = {
  children: ReactNode;
  className?: string;
  /** Duas colunas com larguras iguais (ex.: nome + e-mail). */
  balanced?: boolean;
  /** Três colunas (ex.: logradouro + número + complemento). */
  triple?: boolean;
};

/** Duas colunas no modal (padrão: campo largo + coluna fixa; `balanced`: metade/metade; `triple`: três colunas). */
export default function ModalFormGrid({ children, className, balanced, triple }: ModalFormGridProps) {
  const classes = [
    "modal-form-grid",
    balanced && "modal-form-grid--balanced",
    triple && "modal-form-grid--triple",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={classes}>{children}</div>;
}
