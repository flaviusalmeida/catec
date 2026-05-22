import { useId, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import FileRow from "../projeto/detalhe/FileRow";
import { DEFAULT_UPLOAD_MAX_BYTES, validarArquivoUpload } from "../../utils/uploadFileValidation";
import "./UploadCard.css";

export const DEFAULT_UPLOAD_ACCEPT = ".pdf,.doc,.docx,image/jpeg,image/png";
export const DEFAULT_UPLOAD_TYPES_HINT = "PDF, DOC, DOCX até 10MB";

export type UploadCardFile = {
  nomeArquivo: string;
  meta?: string;
};

export type UploadCardProps = {
  /** Rótulo da área vazia (ex.: "Enviar proposta"). */
  title?: string;
  typesHint?: string;
  accept?: string;
  file?: UploadCardFile | null;
  uploading?: boolean;
  disabled?: boolean;
  maxSizeBytes?: number;
  /** Título da seção — só exibido quando há arquivo. */
  documentSectionTitle?: string;
  onUpload: (file: File) => void;
  onDownload?: () => void;
  onError?: (message: string) => void;
  inputId?: string;
  className?: string;
};

export default function UploadCard({
  title = "Enviar arquivo",
  typesHint = DEFAULT_UPLOAD_TYPES_HINT,
  accept = DEFAULT_UPLOAD_ACCEPT,
  file,
  uploading = false,
  disabled = false,
  maxSizeBytes = DEFAULT_UPLOAD_MAX_BYTES,
  documentSectionTitle,
  onUpload,
  onDownload,
  onError,
  inputId,
  className,
}: UploadCardProps) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const resolvedInputId = inputId ?? `upload-card-${generatedId}`;

  const interacaoBloqueada = disabled || uploading;

  function abrirSeletor() {
    if (interacaoBloqueada) return;
    inputRef.current?.click();
  }

  function processarArquivo(selected: File | undefined) {
    if (!selected || interacaoBloqueada) return;
    const erro = validarArquivoUpload(selected, maxSizeBytes);
    if (erro) {
      onError?.(erro);
      return;
    }
    onUpload(selected);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    processarArquivo(selected);
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (interacaoBloqueada) return;
    dragCounterRef.current += 1;
    setIsDragOver(true);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    if (interacaoBloqueada) return;
    const dropped = event.dataTransfer.files?.[0];
    processarArquivo(dropped);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      abrirSeletor();
    }
  }

  const handlersDropZone = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };

  const inputOculto = (
    <input
      ref={inputRef}
      id={resolvedInputId}
      type="file"
      className="upload-card__input"
      accept={accept}
      disabled={interacaoBloqueada}
      onChange={handleChange}
      tabIndex={-1}
      aria-hidden
    />
  );

  if (file) {
    const rootClass = [
      "upload-card",
      "upload-card--has-file",
      isDragOver ? "upload-card--drag-over" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={rootClass} {...handlersDropZone}>
        {inputOculto}
        {documentSectionTitle ? (
          <p className="upload-card__section-title">{documentSectionTitle}</p>
        ) : null}
        <FileRow
          nomeArquivo={file.nomeArquivo}
          meta={file.meta}
          onDownload={onDownload ?? (() => undefined)}
          onReplace={interacaoBloqueada ? undefined : abrirSeletor}
          replaceLabel="Substituir"
          showDownload={Boolean(onDownload)}
        />
        {uploading ? (
          <p className="upload-card__status" role="status" aria-live="polite">
            <span className="upload-card__spinner" aria-hidden />
            Enviando arquivo…
          </p>
        ) : null}
      </div>
    );
  }

  const rootClass = [
    "upload-card",
    "upload-card--empty",
    uploading ? "upload-card--uploading" : null,
    disabled ? "upload-card--disabled" : null,
    isDragOver ? "upload-card--drag-over" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} {...handlersDropZone}>
      {inputOculto}
      <button
        type="button"
        className="upload-card__trigger"
        onClick={abrirSeletor}
        onKeyDown={handleKeyDown}
        disabled={interacaoBloqueada}
        aria-labelledby={`${resolvedInputId}-label`}
      >
        {uploading ? (
          <>
            <span className="upload-card__spinner" aria-hidden />
            <span className="upload-card__trigger-title">Enviando arquivo…</span>
          </>
        ) : (
          <>
            <span className="upload-card__icon" aria-hidden>
              ⬆
            </span>
            <span id={`${resolvedInputId}-label`} className="upload-card__trigger-title">
              {title}
            </span>
            {typesHint ? <span className="upload-card__trigger-hint">{typesHint}</span> : null}
          </>
        )}
      </button>
    </div>
  );
}
