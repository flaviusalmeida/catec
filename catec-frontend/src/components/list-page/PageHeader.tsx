import type { ReactNode } from "react";
import "../layout/PageToolbar.css";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** CTA principal e ações secundárias (toolbar à direita). */
  actions?: ReactNode;
  className?: string;
};

/** Cabeçalho padrão de páginas administrativas e listagens. */
export default function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
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
