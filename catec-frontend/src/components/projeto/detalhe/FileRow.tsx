import GhostButton from "../../buttons/GhostButton";

type Props = {
  nomeArquivo: string;
  meta?: string;
  onDownload: () => void;
  downloadLabel?: string;
};

export default function FileRow({ nomeArquivo, meta, onDownload, downloadLabel = "Baixar" }: Props) {
  return (
    <div className="proj-detalhe-file-row">
      <span className="proj-detalhe-file-row__icon" aria-hidden>
        📄
      </span>
      <div className="proj-detalhe-file-row__info">
        <span className="proj-detalhe-file-row__nome">{nomeArquivo}</span>
        {meta ? <span className="proj-detalhe-file-row__meta">{meta}</span> : null}
      </div>
      <GhostButton className="proj-detalhe-file-row__btn" onClick={onDownload}>
        {downloadLabel}
      </GhostButton>
    </div>
  );
}
