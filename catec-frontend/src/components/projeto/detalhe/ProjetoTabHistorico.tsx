import { useAuth } from "../../../auth/AuthContext";
import PaginationBar from "../../table/PaginationBar";
import EmptyState from "../../ui/EmptyState";
import InlineAlert from "../../ui/InlineAlert";
import { useProjetoHistoricoFluxo } from "../../../hooks/useProjetoHistoricoFluxo";
import { detalheTransicaoHistorico, rotuloHistoricoItem } from "../../../utils/painelHistoricoFormat";
import { formatInstantBr } from "../../../utils/dateTimeBr";

type Props = {
  projetoId: number;
  refreshKey?: number;
};

export default function ProjetoTabHistorico({ projetoId, refreshKey = 0 }: Props) {
  const { logout } = useAuth();
  const fluxo = useProjetoHistoricoFluxo(projetoId, refreshKey, logout);

  if (fluxo.erro) {
    return <InlineAlert variant="error">{fluxo.erro}</InlineAlert>;
  }

  if (fluxo.carregando && fluxo.itens.length === 0) {
    return <p className="proj-detalhe-loading">Carregando histórico…</p>;
  }

  if (!fluxo.carregando && fluxo.itens.length === 0) {
    return (
      <EmptyState
        variant="inline"
        title="Sem registros"
        description="Ainda não há auditoria ou interações registradas para este projeto."
      />
    );
  }

  return (
    <div className="proj-detalhe-historico-fluxo">
      <p className="proj-detalhe-historico-fluxo__hint">
        Auditoria de status e interações do fluxo comercial, em ordem cronológica reversa.
      </p>

      <ul className="proj-detalhe-historico-fluxo__lista" aria-busy={fluxo.carregando}>
        {fluxo.itens.map((item) => (
          <li key={`${item.origem}-${item.registroId}`} className="proj-detalhe-historico-fluxo__item">
            <div className="proj-detalhe-historico-fluxo__item-head">
              <span className="proj-detalhe-historico-fluxo__item-tipo">{rotuloHistoricoItem(item)}</span>
              <time className="proj-detalhe-historico-fluxo__item-data" dateTime={item.ocorridoEm}>
                {formatInstantBr(item.ocorridoEm)}
              </time>
            </div>
            <p className="proj-detalhe-historico-fluxo__item-meta">
              {item.usuarioNome}
              {detalheTransicaoHistorico(item) ? ` · ${detalheTransicaoHistorico(item)}` : null}
            </p>
            {item.texto ? <p className="proj-detalhe-historico-fluxo__item-texto">{item.texto}</p> : null}
          </li>
        ))}
      </ul>

      <PaginationBar
        className="proj-detalhe-historico-fluxo__paginacao"
        page={fluxo.page}
        pageSize={fluxo.pageSize}
        totalElements={fluxo.totalElements}
        totalPages={fluxo.totalPages}
        onPageChange={fluxo.setPage}
        disabled={fluxo.carregando}
      />
    </div>
  );
}
