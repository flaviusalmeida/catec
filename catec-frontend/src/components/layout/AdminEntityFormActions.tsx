import type { ReactNode } from "react";
import ModalFooter from "./ModalFooter";
import "./AdminEntityFormActions.css";

export type AdminEntityFormActionsProps = {
  /** Zona destrutiva à esquerda (ex.: Remover). */
  danger?: ReactNode;
  /** Cancelar, Salvar, etc. */
  children: ReactNode;
};

/** Rodapé de ações padrão para `AdminEntityFormPage` (perigo isolado + grupo principal). */
export default function AdminEntityFormActions({ danger, children }: AdminEntityFormActionsProps) {
  return (
    <ModalFooter className="admin-entity-form-actions">
      {danger != null ? <div className="admin-entity-form-actions__danger">{danger}</div> : null}
      <div className="admin-entity-form-actions__main">{children}</div>
    </ModalFooter>
  );
}
