import type { ReactNode } from "react";
import "./ModalFormGrid.css";

export type ModalFormGridProps = {
  children: ReactNode;
  className?: string;
  /** Duas colunas com larguras iguais (ex.: nome + e-mail). */
  balanced?: boolean;
};

/** Duas colunas no modal (padrão: campo largo + coluna fixa; `balanced`: metade/metade). */
export default function ModalFormGrid({ children, className, balanced }: ModalFormGridProps) {
  const classes = ["modal-form-grid", balanced && "modal-form-grid--balanced", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
