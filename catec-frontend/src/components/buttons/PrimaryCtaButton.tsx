import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./PrimaryCtaButton.css";

export type PrimaryCtaButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
};

/** Ação primária no cabeçalho da página (ex.: "Novo cliente"); mesma escala do botão primário do modal. */
export default function PrimaryCtaButton({ children, className, ...rest }: PrimaryCtaButtonProps) {
  const classes = ["primary-cta-button", className].filter(Boolean).join(" ");

  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}
