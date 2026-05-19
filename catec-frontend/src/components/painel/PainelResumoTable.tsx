import { Link } from "react-router-dom";
import DataTableSection from "../layout/DataTableSection";
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
  projetoSelecionadoId: number | null;
  onPageChange: (page: number) => void;
  onSelecionarProjeto: (projetoId: number) => void;
};

export default function PainelResumoTable({
  itens,
  carregando,
  page,
  pageSize,
  totalElements,
  totalPages,
  projetoSelecionadoId,
  onPageChange,
  onSelecionarProjeto,
}: PainelResumoTableProps) {
  return (
    <section className="painel-resumo-table" aria-labelledby="painel-resumo-titulo">
      <h2 id="painel-resumo-titulo" className="painel-resumo-table__titulo">
        Visão geral dos projetos
      </h2>
      <DataTableSection
        loading={carregando}
        loadingLabel="Carregando projetos…"
        empty={!carregando && itens.length === 0}
        emptyTitle="Nenhum projeto encontrado"
        emptyDescription="Ajuste os filtros ou cadastre uma nova demanda em Projetos."
      >
        <table className="admin-crud-table painel-resumo-table__grid">
          <thead>
            <tr>
              <th scope="col">Projeto</th>
              <th scope="col">Cliente</th>
              <th scope="col">Fase macro</th>
              <th scope="col">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((row) => {
              const selecionado = projetoSelecionadoId === row.projetoId;
              return (
                <tr
                  key={row.projetoId}
                  className={selecionado ? "painel-resumo-table__row--selected" : undefined}
                  onClick={() => onSelecionarProjeto(row.projetoId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelecionarProjeto(row.projetoId);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-selected={selecionado}
                >
                  <td data-label="Projeto">
                    <Link
                      to={`/app/projetos/${row.projetoId}`}
                      className="painel-resumo-table__link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.titulo}
                    </Link>
                  </td>
                  <td data-label="Cliente">{row.clienteNome ?? "—"}</td>
                  <td data-label="Fase macro">
                    <FaseMacroBadge fase={row.faseMacro} />
                  </td>
                  <td data-label="Atualizado">{formatInstantBr(row.atualizadoEm)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <PaginationBar
          page={page}
          pageSize={pageSize}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={carregando}
        />
      </DataTableSection>
    </section>
  );
}
