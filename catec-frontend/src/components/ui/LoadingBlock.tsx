import "./LoadingBlock.css";

export type LoadingBlockProps = {
  /** Texto abaixo do spinner (ex.: "Carregando lista..."). */
  label?: string;
  className?: string;
};

export default function LoadingBlock({ label = "Carregando lista...", className }: LoadingBlockProps) {
  const rootClass = ["loading-block", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} role="status" aria-live="polite">
      <div className="loading-block__spinner" aria-hidden />
      <p className="loading-block__label">{label}</p>
    </div>
  );
}
