import type { ReactNode } from "react";
import { useId } from "react";
import "./AccessDeniedCard.css";

export type AccessDeniedCardProps = {
  title: string;
  message: ReactNode;
  /** `id` do título para `aria-labelledby` no cartão. Se omitido, gera um id estável com `useId`. */
  titleId?: string;
  className?: string;
};

/**
 * Cartão exibido quando o usuário não tem permissão para a tela (ex.: não é admin).
 */
export default function AccessDeniedCard({ title, message, titleId: titleIdProp, className }: AccessDeniedCardProps) {
  const reactId = useId().replace(/:/g, "");
  const titleId = titleIdProp ?? `access-denied-title-${reactId}`;
  const rootClass = ["access-denied-card", className].filter(Boolean).join(" ");

  return (
    <section className={rootClass} aria-labelledby={titleId}>
      <h1 id={titleId} className="access-denied-card__title">
        {title}
      </h1>
      <div className="access-denied-card__message">{message}</div>
    </section>
  );
}
