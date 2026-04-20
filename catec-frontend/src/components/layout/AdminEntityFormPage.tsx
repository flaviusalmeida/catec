import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./AdminEntityFormPage.css";
import "./adminEntityFormTheme.css";

export type AdminEntityFormPageProps = {
  /** Rota da listagem (ex.: `/app/clientes`). */
  listPath: string;
  /** Texto do link de retorno. */
  backLabel?: string;
  /** Valor de `id` no título principal (acessibilidade). */
  titleId: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Conteúdo do formulário (secções, campos). */
  children: ReactNode;
  /** Faixa de ações (ex.: `ModalFooter` com Cancelar / Salvar). */
  footer: ReactNode;
  /** Classe extra na raiz (ex.: fundo da página, tema do formulário). */
  pageClassName?: string;
};

/**
 * Página dedicada a criar/editar entidades com muitos campos (alternativa ao `FormDialog` em telas compactas).
 */
export default function AdminEntityFormPage({
  listPath,
  backLabel = "Voltar para a lista",
  titleId,
  title,
  subtitle,
  children,
  footer,
  pageClassName,
}: AdminEntityFormPageProps) {
  const rootClass = ["admin-entity-form-page", "admin-entity-form", pageClassName].filter(Boolean).join(" ");
  return (
    <div className={rootClass}>
      <div className="admin-entity-form-page__inner">
        <Link to={listPath} className="admin-entity-form-page__back">
          ← {backLabel}
        </Link>
        <header className="admin-entity-form-page__header">
          <h1 id={titleId} className="admin-entity-form-page__title">
            {title}
          </h1>
          {subtitle != null && subtitle !== "" ? <p className="admin-entity-form-page__subtitle">{subtitle}</p> : null}
        </header>
        <div className="admin-entity-form-page__main">{children}</div>
        <div className="admin-entity-form-page__footer">{footer}</div>
      </div>
    </div>
  );
}
