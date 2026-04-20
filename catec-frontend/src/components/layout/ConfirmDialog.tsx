import type { ReactNode } from "react";
import ModalFooter from "./ModalFooter";
import "./ConfirmDialog.css";

export type ConfirmDialogProps = {
  open: boolean;
  titleId: string;
  title: ReactNode;
  description: ReactNode;
  onBackdropClick: () => void;
  /** Faixa de botões (ex.: Cancelar + Confirmar). */
  actions: ReactNode;
};

/**
 * Modal compacto de confirmação (título, texto e ações).
 */
export default function ConfirmDialog({ open, titleId, title, description, onBackdropClick, actions }: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="confirm-dialog__backdrop" role="presentation" onClick={onBackdropClick}>
      <div
        className="confirm-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="confirm-dialog__title">
          {title}
        </h2>
        <div className="confirm-dialog__description">{description}</div>
        <ModalFooter>{actions}</ModalFooter>
      </div>
    </div>
  );
}
