import type { ReactNode } from "react";
import { useId } from "react";
import "./ModalSection.css";

export type ModalSectionProps = {
  title: string;
  children: ReactNode;
  /** `id` do título (acessibilidade). Se omitido, gera com `useId`. */
  titleId?: string;
  className?: string;
};

/** Faixa de formulário em modal (título de seção + borda superior). */
export default function ModalSection({ title, children, titleId: titleIdProp, className }: ModalSectionProps) {
  const gen = useId().replace(/:/g, "");
  const titleId = titleIdProp ?? `modal-section-${gen}`;
  const rootClass = ["modal-section", className].filter(Boolean).join(" ");

  return (
    <section className={rootClass} aria-labelledby={titleId}>
      <h3 id={titleId} className="modal-section__title">
        {title}
      </h3>
      {children}
    </section>
  );
}
