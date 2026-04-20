import type { ReactNode } from "react";
import "./PageToolbar.css";

export type PageToolbarProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

/**
 * Cabeçalho padrão de telas CRUD: título, subtítulo opcional e ações à direita (ex.: "Novo …").
 */
export default function PageToolbar({ title, subtitle, actions, className }: PageToolbarProps) {
  const rootClass = ["page-toolbar", className].filter(Boolean).join(" ");

  return (
    <header className={rootClass}>
      <div className="page-toolbar__text">
        <h1 className="page-toolbar__title">{title}</h1>
        {subtitle ? <p className="page-toolbar__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-toolbar__actions">{actions}</div> : null}
    </header>
  );
}
