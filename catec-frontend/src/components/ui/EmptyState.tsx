import type { HTMLAttributes } from "react";
import "./EmptyState.css";

export type EmptyStateProps = {
  message: string;
  className?: string;
} & Pick<HTMLAttributes<HTMLDivElement>, "role">;

export default function EmptyState({ message, className, role = "status" }: EmptyStateProps) {
  const rootClass = ["empty-state", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} role={role}>
      <p className="empty-state__message">{message}</p>
    </div>
  );
}
