import type { HTMLAttributes, ReactNode } from "react";
import "./InlineAlert.css";

export type InlineAlertVariant = "error" | "success";

export type InlineAlertProps = {
  variant: InlineAlertVariant;
  children: ReactNode;
  /** Estilo compacto com sombra (uso típico dentro de `ToastAlert`). */
  tone?: "default" | "toast";
  onDismiss?: () => void;
  dismissAriaLabel?: string;
  dismissTitle?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export default function InlineAlert({
  variant,
  children,
  tone = "default",
  onDismiss,
  dismissAriaLabel = "Fechar",
  dismissTitle,
  className,
  role,
  ...rest
}: InlineAlertProps) {
  const rootClass = [
    "inline-alert",
    variant === "error" ? "inline-alert--error" : "inline-alert--success",
    tone === "toast" ? "inline-alert--toast" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const defaultRole = variant === "error" ? "alert" : undefined;
  const resolvedRole = tone === "toast" ? undefined : (role ?? defaultRole);

  return (
    <div {...rest} className={rootClass} role={resolvedRole}>
      <span className="inline-alert__body">{children}</span>
      {onDismiss ? (
        <button
          type="button"
          className="inline-alert__dismiss inline-alert__dismiss--icon"
          onClick={onDismiss}
          aria-label={dismissAriaLabel}
          title={dismissTitle ?? dismissAriaLabel}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
