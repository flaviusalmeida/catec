import type { ReactNode } from "react";
import InlineAlert, { type InlineAlertVariant } from "./InlineAlert";
import "./ToastAlert.css";

export type ToastAlertProps = {
  open: boolean;
  variant?: InlineAlertVariant;
  onDismiss: () => void;
  dismissAriaLabel?: string;
  dismissTitle?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Notificação fixa no canto (ex.: sucesso após salvar). Usa `InlineAlert` em modo toast.
 */
export default function ToastAlert({
  open,
  variant = "success",
  onDismiss,
  dismissAriaLabel,
  dismissTitle,
  children,
  className,
}: ToastAlertProps) {
  if (!open) {
    return null;
  }

  const wrapClass = ["toast-alert__wrap", className].filter(Boolean).join(" ");

  return (
    <div className={wrapClass} role="status" aria-live="polite">
      <InlineAlert variant={variant} tone="toast" onDismiss={onDismiss} dismissAriaLabel={dismissAriaLabel} dismissTitle={dismissTitle}>
        {children}
      </InlineAlert>
    </div>
  );
}
