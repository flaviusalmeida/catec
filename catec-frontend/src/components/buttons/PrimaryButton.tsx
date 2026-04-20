import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./PrimaryButton.css";

export type PrimaryButtonVariant = "default" | "toolbar" | "danger";

export type PrimaryButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  variant?: PrimaryButtonVariant;
  children: ReactNode;
};

/**
 * Botão primário da aplicação. `toolbar` = ação no cabeçalho (ex.: Novo); `danger` = ação destrutiva (ex.: Confirmar remoção).
 */
export default function PrimaryButton({
  variant = "default",
  children,
  className,
  ...rest
}: PrimaryButtonProps) {
  const classes = [
    "primary-button",
    variant === "toolbar" ? "primary-button--toolbar" : null,
    variant === "danger" ? "primary-button--danger" : null,
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
