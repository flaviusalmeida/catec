import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./SecondaryButton.css";

export type SecondaryButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
};

/**
 * CTA secundário (outline) — ação alternativa em fluxos com branching.
 */
export default function SecondaryButton({ children, className, ...rest }: SecondaryButtonProps) {
  const classes = ["secondary-button", className].filter(Boolean).join(" ");

  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}
