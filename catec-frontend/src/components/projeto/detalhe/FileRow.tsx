type Props = {
  nomeArquivo: string;
  meta?: string;
  onDownload: () => void;
};

export default function FileRow({ nomeArquivo, meta, onDownload }: Props) {
  return (
    <div className="proj-detalhe-file-row">
      <div className="proj-detalhe-file-row__content">
        <div className="proj-detalhe-file-row__file">
          <span className="proj-detalhe-file-row__icon" aria-hidden>
            📄
          </span>
          <span className="proj-detalhe-file-row__nome">{nomeArquivo}</span>
        </div>
        {meta ? <span className="proj-detalhe-file-row__meta">{meta}</span> : null}
      </div>
      <button type="button" className="proj-detalhe-file-row__download" onClick={onDownload}>
        <span className="proj-detalhe-file-row__download-icon" aria-hidden>
          ⬇
        </span>
        Baixar
      </button>
    </div>
  );
}
