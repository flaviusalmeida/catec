import type { ReactNode } from "react";

export type FilterFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
};

/** Campo de filtro com rótulo padronizado (use com `FieldControl`). */
export default function FilterField({ id, label, children }: FilterFieldProps) {
  return (
    <div>
      <label className="filters-card__label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}
