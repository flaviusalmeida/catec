import "./LabeledSwitch.css";

export type LabeledSwitchProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
};

/** Interruptor acessível com rótulo à direita (padrão visual admin). */
export default function LabeledSwitch({ id, checked, onChange, label, disabled, className }: LabeledSwitchProps) {
  const rootClass = ["labeled-switch", className].filter(Boolean).join(" ");
  return (
    <label className={rootClass} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="labeled-switch__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="labeled-switch__track" aria-hidden />
      <span className="labeled-switch__copy">
        <span className="labeled-switch__title">{label}</span>
      </span>
    </label>
  );
}
