import type { ReactNode } from "react";
import "./StatusBadge.css";

export type StatusBadgeVariant =
  | "ativo"
  | "inativo"
  | "pendente"
  /** Fluxo de projeto (listagens admin). */
  | "workflow_criado"
  | "workflow_aguardando"
  | "workflow_em_proposta";

export type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  children: ReactNode;
  className?: string;
};

export function StatusBadgeGroup({ children, className }: { children: ReactNode; className?: string }) {
  const classes = ["status-badge-group", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}

/** Pill de estado (tabelas admin, listagens). */
export default function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  const classes = ["status-badge", `status-badge--${variant}`, className].filter(Boolean).join(" ");
  return <span className={classes}>{children}</span>;
}
