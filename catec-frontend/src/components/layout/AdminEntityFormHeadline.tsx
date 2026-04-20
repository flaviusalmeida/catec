import type { ReactNode } from "react";
import "./AdminEntityFormHeadline.css";

export type AdminEntityFormHeadlineProps = {
  /** Texto da ação (ex.: "Editar cliente", "Novo fornecedor"). */
  action: ReactNode;
  /** Linha após " — " (nome do registro, código, etc.). Omitir em criação. */
  entityLabel?: ReactNode;
};

/** Conteúdo do `<h1>` em páginas `AdminEntityFormPage` (ação + registro). */
export default function AdminEntityFormHeadline({ action, entityLabel }: AdminEntityFormHeadlineProps) {
  const hasEntity = entityLabel != null && entityLabel !== "";
  return (
    <span className="admin-entity-form-headline">
      <span className="admin-entity-form-headline__action">{action}</span>
      {hasEntity ? (
        <>
          <span className="admin-entity-form-headline__sep" aria-hidden="true">
            {" "}
            —{" "}
          </span>
          <span className="admin-entity-form-headline__entity">{entityLabel}</span>
        </>
      ) : null}
    </span>
  );
}
