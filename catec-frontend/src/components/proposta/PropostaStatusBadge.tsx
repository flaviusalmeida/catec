import StatusBadge, { type StatusBadgeVariant } from "../ui/StatusBadge";
import type { PropostaStatus } from "../../pages/propostaTypes";
import { STATUS_PROPOSTA_ROTULO } from "../../pages/propostaTypes";

function variantFor(status: PropostaStatus): StatusBadgeVariant {
  switch (status) {
    case "ACEITA":
    case "APROVADA_INTERNA":
      return "ativo";
    case "NEGADA":
      return "inativo";
    case "PENDENTE_AVALIACAO_SOCIO":
    case "AGUARDANDO_AJUSTE_ADM":
    case "ENVIADA_AO_CLIENTE":
    case "EM_AVALIACAO_CLIENTE":
      return "pendente";
    default:
      return "pendente";
  }
}

export default function PropostaStatusBadge({ status }: { status: PropostaStatus }) {
  return <StatusBadge variant={variantFor(status)}>{STATUS_PROPOSTA_ROTULO[status]}</StatusBadge>;
}
