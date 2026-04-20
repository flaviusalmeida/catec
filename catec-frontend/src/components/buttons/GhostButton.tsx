import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./GhostButton.css";

export type GhostButtonVariant = "default" | "danger";

export type GhostButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  variant?: GhostButtonVariant;
  children: ReactNode;
};

export default function GhostButton({
  variant = "default",
  children,
  className,
  ...rest
}: GhostButtonProps) {
  const classes = [
    "ghost-button",
    variant === "danger" ? "ghost-button--danger" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}
