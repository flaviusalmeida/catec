import GhostButton from "../../buttons/GhostButton";
import { downloadDocumento } from "../../../utils/downloadDocumento";
import type { HistoricoDocumentoRow } from "../../../hooks/useProjetoFluxoData";

type Props = {
  rows: HistoricoDocumentoRow[];
  carregando?: boolean;
};

export default function ProjetoTabHistorico({ rows, carregando }: Props) {
  if (carregando) {
    return <p className="proj-detalhe-loading">Carregando histórico…</p>;
  }

  if (rows.length === 0) {
    return <p className="proj-detalhe-hint">Nenhum documento registrado neste projeto.</p>;
  }

  return (
    <>
      <div className="proj-detalhe-table-wrap proj-detalhe-table-wrap--desktop">
        <table className="proj-detalhe-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Versão</th>
              <th>Data</th>
              <th>Autor</th>
              <th>Arquivo</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td>{r.tipo}</td>
                <td>v{r.versao}</td>
                <td>{r.data}</td>
                <td>{r.autor}</td>
                <td>
                  <span className="proj-detalhe-table__arquivo">
                    <span className="proj-detalhe-table__arquivo-icon" aria-hidden>
                      📄
                    </span>
                    {r.nomeArquivo}
                  </span>
                </td>
                <td>
                  <GhostButton onClick={() => void downloadDocumento(r.documentoId, r.nomeArquivo)}>
                    Baixar
                  </GhostButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="proj-detalhe-historico-cards">
        {rows.map((r) => (
          <article key={r.key} className="proj-detalhe-historico-card">
            <div className="proj-detalhe-historico-card__row">
              <span className="proj-detalhe-historico-card__label">Tipo</span>
              <span>{r.tipo}</span>
            </div>
            <div className="proj-detalhe-historico-card__row">
              <span className="proj-detalhe-historico-card__label">Versão</span>
              <span>v{r.versao}</span>
            </div>
            <div className="proj-detalhe-historico-card__row">
              <span className="proj-detalhe-historico-card__label">Data</span>
              <span>{r.data}</span>
            </div>
            <div className="proj-detalhe-historico-card__row">
              <span className="proj-detalhe-historico-card__label">Autor</span>
              <span>{r.autor}</span>
            </div>
            <div className="proj-detalhe-historico-card__row">
              <span className="proj-detalhe-historico-card__label">Arquivo</span>
              <span>
                📄 {r.nomeArquivo}
              </span>
            </div>
            <div className="proj-detalhe-historico-card__row">
              <GhostButton onClick={() => void downloadDocumento(r.documentoId, r.nomeArquivo)}>
                Baixar
              </GhostButton>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
