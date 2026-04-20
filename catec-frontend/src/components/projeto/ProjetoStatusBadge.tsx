import StatusBadge, { type StatusBadgeVariant } from "../ui/StatusBadge";
import type { ProjetoStatus } from "../../pages/projetoTypes";
import { STATUS_PROJETO_ROTULO } from "../../pages/projetoTypes";
import "./ProjetoStatusBadge.css";

const VARIANT_POR_STATUS: Record<ProjetoStatus, StatusBadgeVariant> = {
  CRIADO: "workflow_criado",
  AGUARDANDO_ADM: "workflow_aguardando",
  EM_PROPOSTA: "workflow_em_proposta",
};

export default function ProjetoStatusBadge({ status }: { status: ProjetoStatus }) {
  return (
    <StatusBadge variant={VARIANT_POR_STATUS[status]} className="projeto-status-badge">
      {STATUS_PROJETO_ROTULO[status]}
    </StatusBadge>
  );
}
