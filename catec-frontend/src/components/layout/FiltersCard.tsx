import type { ReactNode } from "react";
import TextLinkButton from "../buttons/TextLinkButton";
import "./FiltersCard.css";

export type FiltersCardProps = {
  /** Valor de `id` no título, para `aria-labelledby` da seção. */
  headingId: string;
  title?: string;
  onClear: () => void;
  clearLabel?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Cartão de filtros padrão (título, limpar, área em grid para os campos).
 */
export default function FiltersCard({
  headingId,
  title = "Filtros",
  onClear,
  clearLabel = "Limpar filtros",
  children,
  className,
}: FiltersCardProps) {
  const sectionClass = ["filters-card", className].filter(Boolean).join(" ");

  return (
    <section className={sectionClass} aria-labelledby={headingId}>
      <div className="filters-card__head">
        <h2 id={headingId} className="filters-card__title">
          {title}
        </h2>
        <TextLinkButton onClick={onClear}>
          {clearLabel}
        </TextLinkButton>
      </div>
      <div className="filters-card__grid">{children}</div>
    </section>
  );
}
