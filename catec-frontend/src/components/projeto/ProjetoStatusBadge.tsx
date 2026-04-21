import StatusBadge, { StatusBadgeGroup } from "../ui/StatusBadge";
import type { ProjetoStatus } from "../../pages/projetoTypes";
import { STATUS_PROJETO_ROTULO_BADGE } from "../../pages/projetoTypes";

const VARIANT_POR_STATUS: Record<ProjetoStatus, "inativo" | "pendente" | "ativo"> = {
  PENDENTE_CLIENTE: "pendente",
  AGUARDANDO_PROPOSTA_COMERCIAL: "pendente",
  ELABORANDO_PROPOSTA: "pendente",
  PROPOSTA_CONCLUIDA: "ativo",
};

/** Estado na listagem de projetos — mesma pill e grupo que em Usuários (`UsuarioStatusBadge`). */
export default function ProjetoStatusBadge({ status }: { status: ProjetoStatus }) {
  return (
    <StatusBadgeGroup>
      <StatusBadge variant={VARIANT_POR_STATUS[status]}>{STATUS_PROJETO_ROTULO_BADGE[status]}</StatusBadge>
    </StatusBadgeGroup>
  );
}
