import type { ReactNode } from "react";
import "./PainelIndicadorCard.css";

export type PainelIndicadorCardProps = {
  label: string;
  value: number;
  hint?: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

/**
 * Card numérico do painel (indicador clicável para aplicar filtro).
 */
export default function PainelIndicadorCard({
  label,
  value,
  hint,
  active = false,
  onClick,
}: PainelIndicadorCardProps) {
  const className = [
    "painel-indicador-card",
    onClick ? "painel-indicador-card--clickable" : null,
    active ? "painel-indicador-card--active" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span className="painel-indicador-card__value">{value}</span>
      <span className="painel-indicador-card__label">{label}</span>
      {hint ? <span className="painel-indicador-card__hint">{hint}</span> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} aria-pressed={active}>
        {inner}
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
}
