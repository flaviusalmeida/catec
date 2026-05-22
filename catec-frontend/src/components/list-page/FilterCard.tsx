import type { ReactNode } from "react";
import TextLinkButton from "../buttons/TextLinkButton";
import "../layout/FiltersCard.css";

export type FilterCardProps = {
  headingId: string;
  title?: string;
  onClear: () => void;
  clearLabel?: string;
  children: ReactNode;
  className?: string;
};

/** Cartão de filtros configurável — base de qualquer tela de pesquisa. */
export default function FilterCard({
  headingId,
  title = "Filtros",
  onClear,
  clearLabel = "Limpar filtros",
  children,
  className,
}: FilterCardProps) {
  const sectionClass = ["filters-card", className].filter(Boolean).join(" ");

  return (
    <section className={sectionClass} aria-labelledby={headingId}>
      <div className="filters-card__head">
        <h2 id={headingId} className="filters-card__title">
          {title}
        </h2>
        <TextLinkButton onClick={onClear}>{clearLabel}</TextLinkButton>
      </div>
      <div className="filters-card__grid">{children}</div>
    </section>
  );
}
