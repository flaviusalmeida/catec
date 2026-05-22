import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./tabSection.css";

export type ContextActionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & {
  children: ReactNode;
  icon?: ReactNode;
};

/** CTA contextual padronizado (abas Propostas, Interações, etc.). */
export default function ContextActionButton({
  children,
  icon,
  className,
  disabled,
  ...rest
}: ContextActionButtonProps) {
  const classes = ["context-action-btn", className].filter(Boolean).join(" ");

  return (
    <button type="button" className={classes} disabled={disabled} {...rest}>
      {icon ?? (
        <span className="context-action-btn__icon" aria-hidden>
          +
        </span>
      )}
      <span>{children}</span>
    </button>
  );
}
