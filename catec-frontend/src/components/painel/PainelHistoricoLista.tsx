import DataTableSection from "../layout/DataTableSection";
import PaginationBar from "../table/PaginationBar";
import EmptyState from "../ui/EmptyState";
import type { PainelHistoricoItem, PainelProjetoResumo } from "../../pages/painelTypes";
import { formatInstantBr } from "../../utils/dateTimeBr";
import "./PainelHistoricoLista.css";

function rotuloItem(item: PainelHistoricoItem): string {
  if (item.origem === "INTERACAO" && item.tipoInteracao) {
    return item.tipoInteracao.replaceAll("_", " ").toLowerCase();
  }
  if (item.acao) {
    return item.acao.replaceAll("_", " ").toLowerCase();
  }
  return item.origem === "AUDITORIA" ? "Auditoria" : "Interação";
}

function detalheTransicao(item: PainelHistoricoItem): string | null {
  if (item.statusAnterior && item.statusNovo) {
    return `${item.statusAnterior} → ${item.statusNovo}`;
  }
  return null;
}

export type PainelHistoricoListaProps = {
  projeto: PainelProjetoResumo | null;
  itens: PainelHistoricoItem[];
  carregando: boolean;
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function PainelHistoricoLista({
  projeto,
  itens,
  carregando,
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
}: PainelHistoricoListaProps) {
  return (
    <section className="painel-historico" aria-labelledby="painel-historico-titulo">
      <h2 id="painel-historico-titulo" className="painel-historico__titulo">
        Histórico
      </h2>
      {!projeto ? (
        <EmptyState
          title="Selecione um projeto"
          description="Clique em uma linha da tabela para ver auditoria e interações do fluxo."
          variant="standalone"
        />
      ) : (
        <>
          <p className="painel-historico__projeto-nome">{projeto.titulo}</p>
          <DataTableSection
            loading={carregando}
            loadingLabel="Carregando histórico…"
            empty={!carregando && itens.length === 0}
            emptyTitle="Sem registros"
            emptyDescription="Ainda não há auditoria ou interações para este projeto."
          >
            <ul className="painel-historico__lista">
              {itens.map((item) => (
                <li key={`${item.origem}-${item.registroId}`} className="painel-historico__item">
                  <div className="painel-historico__item-head">
                    <span className="painel-historico__item-tipo">{rotuloItem(item)}</span>
                    <time className="painel-historico__item-data" dateTime={item.ocorridoEm}>
                      {formatInstantBr(item.ocorridoEm)}
                    </time>
                  </div>
                  <p className="painel-historico__item-meta">
                    {item.usuarioNome}
                    {detalheTransicao(item) ? ` · ${detalheTransicao(item)}` : null}
                  </p>
                  {item.texto ? <p className="painel-historico__item-texto">{item.texto}</p> : null}
                </li>
              ))}
            </ul>
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalElements={totalElements}
              totalPages={totalPages}
              onPageChange={onPageChange}
              disabled={carregando}
            />
          </DataTableSection>
        </>
      )}
    </section>
  );
}
