import GhostButton from "../buttons/GhostButton";
import PrimaryButton from "../buttons/PrimaryButton";
import SecondaryButton from "../buttons/SecondaryButton";
import "./WorkflowActionBar.css";

export type WorkflowActionVariant = "primary" | "secondary" | "danger";

export type WorkflowActionBarLayout = "inline" | "stacked";

export type WorkflowAction = {
  /** Identificador estável (opcional, para keys e testes). */
  id?: string;
  label: string;
  variant: WorkflowActionVariant;
  onClick: () => void;
  disabled?: boolean;
  /** Quando definido, a ação só aparece se `permissions` incluir este valor. */
  permission?: string;
  hidden?: boolean;
};

export type WorkflowActionBarProps = {
  /** Omitir ou `undefined` para não exibir label (recomendado). */
  title?: string;
  actions: WorkflowAction[];
  /** Lista de permissões do usuário (ex.: `admin`, `socio`). */
  permissions?: string[];
  /** Status do fluxo (metadado opcional, ex. para testes ou analytics). */
  status?: string;
  layout?: WorkflowActionBarLayout;
  /** Empilha botões em viewport estreita. Padrão: true. */
  stackedOnMobile?: boolean;
  hidden?: boolean;
  className?: string;
};

function isVisible(action: WorkflowAction, permissions?: string[]): boolean {
  if (action.hidden) return false;
  if (action.permission == null) return true;
  return permissions?.includes(action.permission) ?? false;
}

function renderActionButton(action: WorkflowAction, key: string) {
  const disabled = action.disabled ?? false;

  if (action.variant === "primary") {
    return (
      <PrimaryButton key={key} disabled={disabled} onClick={action.onClick}>
        {action.label}
      </PrimaryButton>
    );
  }

  if (action.variant === "secondary") {
    return (
      <SecondaryButton key={key} disabled={disabled} onClick={action.onClick}>
        {action.label}
      </SecondaryButton>
    );
  }

  return (
    <GhostButton
      key={key}
      variant="danger"
      disabled={disabled}
      onClick={action.onClick}
      className="workflow-action-bar__danger"
    >
      {action.label}
    </GhostButton>
  );
}

/**
 * Barra de ações condicionais para fluxos com branching (propostas, contratos, aprovações).
 * Todas as ações são CTAs com hierarchy: primary (filled), secondary (outline), danger (ghost).
 */
export default function WorkflowActionBar({
  title,
  actions,
  permissions,
  status,
  layout = "inline",
  stackedOnMobile = true,
  hidden = false,
  className,
}: WorkflowActionBarProps) {
  if (hidden) return null;

  const visible = actions.filter((a) => isVisible(a, permissions));
  if (visible.length === 0) return null;

  const rootClass = [
    "workflow-action-bar",
    layout === "stacked" ? "workflow-action-bar--stacked" : null,
    stackedOnMobile ? "workflow-action-bar--stack-mobile" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const groupLabel =
    title?.trim() ||
    visible.map((a) => a.label).join(", ") ||
    "Ações do fluxo";

  return (
    <div className={rootClass} data-workflow-status={status}>
      {title?.trim() ? <p className="workflow-action-bar__title">{title}</p> : null}
      <div className="workflow-action-bar__actions" role="group" aria-label={groupLabel}>
        {visible.map((action, index) => {
          const key = action.id ?? `${action.label}-${index}`;
          return renderActionButton(action, key);
        })}
      </div>
    </div>
  );
}
