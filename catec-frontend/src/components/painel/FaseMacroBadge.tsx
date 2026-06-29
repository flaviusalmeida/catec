import StatusBadge, { StatusBadgeGroup, type StatusBadgeVariant } from "../ui/StatusBadge";
import type { FaseMacro } from "../../pages/painelTypes";
import { FASE_MACRO_ROTULO, FASE_MACRO_ROTULO_CURTO } from "../../pages/painelTypes";

function variantFor(fase: FaseMacro): StatusBadgeVariant {
  switch (fase) {
    case "AGUARDANDO_CONTRATO":
    case "AGUARDANDO_EXECUCAO":
    case "EM_EXECUCAO":
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
  const rotuloCompleto = FASE_MACRO_ROTULO[fase];
  return (
    <StatusBadgeGroup>
      <StatusBadge variant={variantFor(fase)} title={rotuloCompleto}>
        {FASE_MACRO_ROTULO_CURTO[fase]}
      </StatusBadge>
    </StatusBadgeGroup>
  );
}
