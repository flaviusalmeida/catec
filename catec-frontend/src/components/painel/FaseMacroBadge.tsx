import StatusBadge, { StatusBadgeGroup, type StatusBadgeVariant } from "../ui/StatusBadge";
import type { FaseMacro } from "../../pages/painelTypes";
import { FASE_MACRO_ROTULO } from "../../pages/painelTypes";

function variantFor(fase: FaseMacro): StatusBadgeVariant {
  switch (fase) {
    case "ENCERRADA_ACEITA":
    case "PROPOSTA_CONCLUIDA":
      return "ativo";
    case "ENCERRADA_NEGADA":
      return "inativo";
    default:
      return "pendente";
  }
}

export default function FaseMacroBadge({ fase }: { fase: FaseMacro }) {
  return (
    <StatusBadgeGroup>
      <StatusBadge variant={variantFor(fase)}>{FASE_MACRO_ROTULO[fase]}</StatusBadge>
    </StatusBadgeGroup>
  );
}
