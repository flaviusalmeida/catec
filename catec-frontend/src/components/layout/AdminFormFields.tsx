import type { ReactNode } from "react";
import "./AdminFormFields.css";

export type AdminFormFieldsProps = {
  children: ReactNode;
  className?: string;
};

/** Coluna de campos com espaçamento vertical padronizado (16px). */
export default function AdminFormFields({ children, className }: AdminFormFieldsProps) {
  const classes = ["admin-form-fields", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
