import type { ReactNode } from "react";
import "./ModalFooter.css";

export type ModalFooterProps = {
  children: ReactNode;
  className?: string;
};

/** Faixa de ações no rodapé do modal (Salvar / Cancelar / …). */
export default function ModalFooter({ children, className }: ModalFooterProps) {
  const classes = ["modal-footer", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
