import type { HTMLAttributes, ReactNode } from "react";
import "./EmptyState.css";

export type EmptyStateProps = {
  title: string;
  description: string;
  /** `standalone`: lista vazia ampla. `inline`: bloco tracejado compacto. `compact`: ainda menor (formulários). */
  variant?: "standalone" | "inline" | "compact";
  /** CTA principal opcional (ex.: "Novo registro"). */
  action?: ReactNode;
  /** Ação secundária opcional. */
  secondaryAction?: ReactNode;
  className?: string;
} & Pick<HTMLAttributes<HTMLDivElement>, "role">;

export default function EmptyState({
  title,
  description,
  variant = "standalone",
  action,
  secondaryAction,
  className,
  role = "status",
}: EmptyStateProps) {
  const rootClass = [
    "empty-state",
    variant === "standalone" ? "empty-state--standalone" : null,
    variant === "inline" ? "empty-state--inline" : null,
    variant === "compact" ? "empty-state--compact" : null,
    action || secondaryAction ? "empty-state--with-actions" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} role={role}>
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__text">{description}</p>
      {action || secondaryAction ? (
        <div className="empty-state__actions">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
