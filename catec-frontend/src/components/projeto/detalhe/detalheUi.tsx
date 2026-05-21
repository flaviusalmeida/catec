import { useId, useState } from "react";
import type { ReactNode } from "react";

export function DashboardCard({
  title,
  titleId,
  actions,
  children,
  className,
  variant,
}: {
  title?: string;
  titleId?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "sidebar" | "escopo";
}) {
  const variantClass =
    variant === "sidebar"
      ? "proj-detalhe-card--sidebar"
      : variant === "escopo"
        ? "proj-detalhe-card--escopo"
        : "";
  return (
    <section
      className={["proj-detalhe-card", variantClass, className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      {title ? (
        <div className="proj-detalhe-card__head">
          <h2 id={titleId} className="proj-detalhe-card__title">
            {title}
          </h2>
          {actions ? <div className="proj-detalhe-card__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="proj-detalhe-card__body">{children}</div>
    </section>
  );
}

export function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="proj-detalhe-info-item">
      <span className="proj-detalhe-info-item__label">{label}</span>
      <span className="proj-detalhe-info-item__value">{children}</span>
    </div>
  );
}

export function InfoGrid({ children }: { children: ReactNode }) {
  return <div className="proj-detalhe-info-grid">{children}</div>;
}

export function CollapsibleText({ text, maxLines = 3 }: { text: string; maxLines?: number }) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  const trimmed = text.trim() || "—";
  const longo = trimmed.length > 180 || trimmed.split("\n").length > maxLines;
  const mostrarFade = longo && !aberto;

  if (!longo) {
    return <p className="proj-detalhe-collapsible__text">{trimmed}</p>;
  }

  return (
    <div className={mostrarFade ? "proj-detalhe-collapsible proj-detalhe-collapsible--fade" : "proj-detalhe-collapsible"}>
      <p
        id={id}
        className={
          aberto
            ? "proj-detalhe-collapsible__text"
            : "proj-detalhe-collapsible__text proj-detalhe-collapsible__text--clamp"
        }
      >
        {trimmed}
      </p>
      <button type="button" className="proj-detalhe-collapsible__toggle" onClick={() => setAberto((v) => !v)}>
        {aberto ? "Ver menos" : "Ver mais"}
      </button>
    </div>
  );
}

export function formatarDataCurta(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatarDataHora(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}
