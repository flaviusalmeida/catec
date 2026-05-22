import type { ReactNode } from "react";
import "./StatusBadge.css";

/** Variantes de cor da pill — design system global de listagens. */
export type StatusBadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "info"
  | "ativo"
  | "inativo"
  | "pendente";

export type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  children: ReactNode;
  className?: string;
};

export function StatusBadgeGroup({ children, className }: { children: ReactNode; className?: string }) {
  const classes = ["status-badge-group", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}

/** Pill de estado — padrão único para listagens admin (usuários, projetos, etc.). */
export default function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  const classes = ["status-badge", `status-badge--${variant}`, className].filter(Boolean).join(" ");
  return <span className={classes}>{children}</span>;
}
