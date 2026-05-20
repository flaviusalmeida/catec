import type { ReactNode } from "react";
import { useId } from "react";
import "./AdminFormSection.css";

export type AdminFormSectionProps = {
  title: string;
  children: ReactNode;
  /** `id` do título (acessibilidade). */
  titleId?: string;
  /** Ação na mesma linha do título, alinhada à direita do cartão (ex.: Nova). */
  actions?: ReactNode;
  className?: string;
};

/** Cartão de seção em formulários longos (`AdminEntityFormPage`). */
export default function AdminFormSection({
  title,
  children,
  titleId: titleIdProp,
  actions,
  className,
}: AdminFormSectionProps) {
  const gen = useId().replace(/:/g, "");
  const titleId = titleIdProp ?? `admin-form-section-${gen}`;
  const rootClass = ["admin-form-section", className].filter(Boolean).join(" ");

  return (
    <section className={rootClass} aria-labelledby={titleId}>
      {actions != null ? (
        <div className="admin-form-section__head">
          <h3 id={titleId} className="admin-form-section__title">
            {title}
          </h3>
          <div className="admin-form-section__actions">{actions}</div>
        </div>
      ) : (
        <h3 id={titleId} className="admin-form-section__title">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}
