import type { HTMLAttributes } from "react";
import "./EmptyState.css";

export type EmptyStateProps = {
  title: string;
  description: string;
  /** `standalone`: lista vazia ampla. `inline`: bloco tracejado compacto. `compact`: ainda menor (formulários). */
  variant?: "standalone" | "inline" | "compact";
  className?: string;
} & Pick<HTMLAttributes<HTMLDivElement>, "role">;

export default function EmptyState({
  title,
  description,
  variant = "standalone",
  className,
  role = "status",
}: EmptyStateProps) {
  const rootClass = [
    "empty-state",
    variant === "standalone" ? "empty-state--standalone" : null,
    variant === "inline" ? "empty-state--inline" : null,
    variant === "compact" ? "empty-state--compact" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} role={role}>
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__text">{description}</p>
    </div>
  );
}
