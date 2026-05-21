import { useAuth } from "../../../auth/AuthContext";
import PaginationBar from "../../table/PaginationBar";
import EmptyState from "../../ui/EmptyState";
import InlineAlert from "../../ui/InlineAlert";
import { useProjetoHistoricoFluxo } from "../../../hooks/useProjetoHistoricoFluxo";
import {
  metaHistoricoItem,
  rotuloHistoricoItem,
  textoHistoricoItem,
} from "../../../utils/painelHistoricoFormat";
import ProjetoTimeline from "./ProjetoTimeline";

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

  const timeline = fluxo.itens.map((item) => ({
    key: `${item.origem}-${item.registroId}`,
    titulo: rotuloHistoricoItem(item),
    meta: metaHistoricoItem(item),
    texto: textoHistoricoItem(item),
  }));

  return (
    <div className="proj-detalhe-historico-fluxo">
      <ProjetoTimeline items={timeline} busy={fluxo.carregando} />
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
