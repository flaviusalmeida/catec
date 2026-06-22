import DataTableSection from "../layout/DataTableSection";
import PaginationBar from "../table/PaginationBar";
import EmptyState from "../ui/EmptyState";
import type { PainelHistoricoItem, PainelProjetoResumo } from "../../pages/painelTypes";
import { formatInstantBr } from "../../utils/dateTimeBr";
import { detalheTransicaoHistorico, rotuloHistoricoItem } from "../../utils/painelHistoricoFormat";
import "./PainelHistoricoLista.css";

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
        <EmptyState message="Selecione um projeto." />
      ) : (
        <>
          <p className="painel-historico__projeto-nome">{projeto.titulo}</p>
          <DataTableSection
            loading={carregando}
            loadingLabel="Carregando histórico…"
            empty={!carregando && itens.length === 0}
            emptyMessage="Nenhum registro encontrado."
          >
            <ul className="painel-historico__lista">
              {itens.map((item) => (
                <li key={`${item.origem}-${item.registroId}`} className="painel-historico__item">
                  <div className="painel-historico__item-head">
                    <span className="painel-historico__item-tipo">{rotuloHistoricoItem(item)}</span>
                    <time className="painel-historico__item-data" dateTime={item.ocorridoEm}>
                      {formatInstantBr(item.ocorridoEm)}
                    </time>
                  </div>
                  <p className="painel-historico__item-meta">
                    {item.usuarioNome}
                    {detalheTransicaoHistorico(item) ? ` · ${detalheTransicaoHistorico(item)}` : null}
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
