import type { HTMLAttributes, ReactNode } from "react";
import "./StateCard.css";

export type StateCardType = "empty" | "locked" | "unavailable" | "no-results";

export type StateCardProps = {
  title: string;
  description?: string;
  type?: StateCardType;
  icon?: ReactNode;
  minHeight?: number | string;
  centered?: boolean;
  className?: string;
} & Pick<HTMLAttributes<HTMLDivElement>, "role">;

/**
 * Feedback padronizado: empty, locked, unavailable e variações.
 * Mensagens curtas — título obrigatório, descrição opcional.
 */
export default function StateCard({
  title,
  description,
  type = "empty",
  icon,
  minHeight,
  centered = false,
  className,
  role = "status",
  style,
  ...rest
}: StateCardProps & Pick<HTMLAttributes<HTMLDivElement>, "style">) {
  const rootClass = [
    "state-card",
    `state-card--${type}`,
    centered ? "state-card--centered" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inlineStyle =
    minHeight != null
      ? { ...style, minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }
      : style;

  return (
    <div className={rootClass} role={role} style={inlineStyle} {...rest}>
      {icon ? <div className="state-card__icon">{icon}</div> : null}
      <p className="state-card__title">{title}</p>
      {description?.trim() ? <p className="state-card__description">{description}</p> : null}
    </div>
  );
}
