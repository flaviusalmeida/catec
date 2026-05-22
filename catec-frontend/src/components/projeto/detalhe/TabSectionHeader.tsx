import ContextActionButton from "./ContextActionButton";
import { TAB_CONTEXT_ACTION_LABEL } from "./tabSectionConstants";
import "./tabSection.css";

export type TabSectionHeaderProps = {
  title: string;
  titleId?: string;
  /** Texto visível do CTA; padrão: `Adicionar`. */
  actionLabel?: string;
  /** Rótulo acessível (contexto da seção); padrão: `Adicionar — {title}`. */
  actionAriaLabel?: string;
  onAction?: () => void;
  hideAction?: boolean;
  actionDisabled?: boolean;
  actionTitle?: string;
};

/** Cabeçalho de seção/aba com título e ação contextual opcional. */
export default function TabSectionHeader({
  title,
  titleId,
  actionLabel = TAB_CONTEXT_ACTION_LABEL,
  actionAriaLabel,
  onAction,
  hideAction = false,
  actionDisabled = false,
  actionTitle,
}: TabSectionHeaderProps) {
  const mostrarAcao = Boolean(onAction && !hideAction);
  const ariaLabel = actionAriaLabel ?? `${actionLabel} — ${title}`;

  return (
    <div className="tab-section-header">
      <h2 id={titleId} className="tab-section-header__title">
        {title}
      </h2>
      {mostrarAcao ? (
        <ContextActionButton
          onClick={onAction}
          disabled={actionDisabled}
          title={actionTitle}
          aria-label={ariaLabel}
        >
          {actionLabel}
        </ContextActionButton>
      ) : null}
    </div>
  );
}
