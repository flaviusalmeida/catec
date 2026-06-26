import { Link } from "react-router-dom";
import EmptyState from "../ui/EmptyState";
import LoadingBlock from "../ui/LoadingBlock";
import PaginationBar from "../table/PaginationBar";
import FaseMacroBadge from "./FaseMacroBadge";
import type { PainelProjetoResumo } from "../../pages/painelTypes";
import { formatInstantBr } from "../../utils/dateTimeBr";
import "./PainelResumoTable.css";

export type PainelResumoTableProps = {
  itens: PainelProjetoResumo[];
  carregando: boolean;
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function PainelResumoTable({
  itens,
  carregando,
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
}: PainelResumoTableProps) {
  const vazio = !carregando && itens.length === 0;

  return (
    <section className="painel-resumo-table" aria-labelledby="painel-resumo-titulo">
      <h2 id="painel-resumo-titulo" className="painel-resumo-table__titulo">
        Projetos em acompanhamento
      </h2>

      <section className="data-table-section painel-resumo-table__card" aria-busy={carregando}>
        {carregando ? (
          <LoadingBlock label="Carregando projetos…" />
        ) : vazio ? (
          <EmptyState message="Nenhum projeto cadastrado." />
        ) : (
          <>
            <div className="data-table-section__wrap">
              <table className="admin-crud-table data-table--painel painel-resumo-table__grid">
                <thead>
                  <tr>
                    <th scope="col">Projeto</th>
                    <th scope="col">Fase atual</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((row, idx) => (
                    <tr
                      key={row.projetoId}
                      className={`admin-crud-table__row${idx % 2 === 1 ? " admin-crud-table__row--alt" : ""}`}
                    >
                      <td data-label="Projeto">
                        <Link to={`/app/projetos/${row.projetoId}`} className="painel-resumo-table__link">
                          {row.titulo}
                        </Link>
                      </td>
                      <td data-label="Fase atual" className="painel-resumo-table__fase">
                        <FaseMacroBadge fase={row.faseMacro} />
                      </td>
                      <td data-label="Cliente" className="painel-resumo-table__cliente">
                        {row.clienteNome ?? "—"}
                      </td>
                      <td data-label="Atualizado" className="painel-resumo-table__atualizado">
                        {formatInstantBr(row.atualizadoEm)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar
              className="painel-resumo-table__paginacao"
              page={page}
              pageSize={pageSize}
              totalElements={totalElements}
              totalPages={totalPages}
              onPageChange={onPageChange}
              disabled={carregando}
            />
          </>
        )}
      </section>
    </section>
  );
}
