import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./TextLinkButton.css";

export type TextLinkButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
};

/** Botão com aparência de link (ex.: “Limpar filtros”). */
export default function TextLinkButton({ children, className, ...rest }: TextLinkButtonProps) {
  const classes = ["text-link-button", className].filter(Boolean).join(" ");

  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}
