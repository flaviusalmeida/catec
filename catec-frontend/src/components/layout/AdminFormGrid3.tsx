import type { ReactNode } from "react";
import "./AdminFormGrid3.css";

export type AdminFormGrid3Props = {
  children: ReactNode;
  className?: string;
};

/** Grelha de três colunas (ex.: Cidade | UF | CEP). Colapsa a uma coluna em ecrãs estreitos. */
export default function AdminFormGrid3({ children, className }: AdminFormGrid3Props) {
  const classes = ["admin-form-grid-3", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
