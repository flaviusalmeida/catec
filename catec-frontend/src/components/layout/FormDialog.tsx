import type { ReactNode } from "react";
import "./FormDialog.css";

export type FormDialogProps = {
  open: boolean;
  titleId: string;
  title: ReactNode;
  onBackdropClick: () => void;
  children: ReactNode;
  /** Classes extras no painel (ex.: largura customizada). */
  panelClassName?: string;
};

/**
 * Modal de formulário: backdrop, painel com título e corpo (`children`).
 */
export default function FormDialog({ open, titleId, title, onBackdropClick, children, panelClassName }: FormDialogProps) {
  if (!open) {
    return null;
  }

  const panelClass = ["form-dialog__panel", panelClassName].filter(Boolean).join(" ");

  return (
    <div className="form-dialog__backdrop" role="presentation" onClick={onBackdropClick}>
      <div
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="form-dialog__title">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
