import type { ReactNode } from "react";
import "./ModalFormGrid.css";

export type ModalFormGridProps = {
  children: ReactNode;
  className?: string;
};

/** Duas colunas no modal (ex.: cidade + UF). */
export default function ModalFormGrid({ children, className }: ModalFormGridProps) {
  const classes = ["modal-form-grid", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
