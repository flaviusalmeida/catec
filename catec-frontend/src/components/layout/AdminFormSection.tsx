import type { ReactNode } from "react";
import { useId } from "react";
import "./AdminFormSection.css";

export type AdminFormSectionProps = {
  title: string;
  children: ReactNode;
  /** `id` do título (acessibilidade). */
  titleId?: string;
  className?: string;
};

/** Cartão de secção em formulários longos (`AdminEntityFormPage`). */
export default function AdminFormSection({ title, children, titleId: titleIdProp, className }: AdminFormSectionProps) {
  const gen = useId().replace(/:/g, "");
  const titleId = titleIdProp ?? `admin-form-section-${gen}`;
  const rootClass = ["admin-form-section", className].filter(Boolean).join(" ");

  return (
    <section className={rootClass} aria-labelledby={titleId}>
      <h3 id={titleId} className="admin-form-section__title">
        {title}
      </h3>
      {children}
    </section>
  );
}
