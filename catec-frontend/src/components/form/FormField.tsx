import type { ReactNode } from "react";
import "./FormField.css";

export type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  error?: string | null;
  className?: string;
  /** Exibe asterisco de obrigatório no rótulo. */
  required?: boolean;
};

/** Label + controle (ex.: `FieldControl`) + erro opcional. */
export default function FormField({ label, htmlFor, children, error, className, required }: FormFieldProps) {
  const rootClass = ["form-field", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="form-field__required" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
