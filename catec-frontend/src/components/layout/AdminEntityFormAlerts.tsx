import type { ReactNode } from "react";
import "./AdminEntityFormAlerts.css";

export type AdminEntityFormAlertsProps = {
  children: ReactNode;
  className?: string;
};

/** Área no topo do formulário (erros, carregamento, avisos). */
export default function AdminEntityFormAlerts({ children, className }: AdminEntityFormAlertsProps) {
  const classes = ["admin-entity-form-alerts", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
