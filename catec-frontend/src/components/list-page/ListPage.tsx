import type { ReactNode } from "react";
import "./ListPage.css";

export type ListPageProps = {
  children: ReactNode;
  className?: string;
};

/** Shell padrão de telas de listagem/pesquisa (largura máxima, stack vertical). */
export default function ListPage({ children, className }: ListPageProps) {
  const rootClass = ["list-page", className].filter(Boolean).join(" ");
  return (
    <div className={rootClass}>
      <div className="list-page__inner list-page__stack">{children}</div>
    </div>
  );
}
