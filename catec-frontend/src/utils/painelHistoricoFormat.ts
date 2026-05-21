import type { PainelHistoricoItem } from "../pages/painelTypes";

export function rotuloHistoricoItem(item: PainelHistoricoItem): string {
  if (item.origem === "INTERACAO" && item.tipoInteracao) {
    return item.tipoInteracao.replaceAll("_", " ");
  }
  if (item.acao) {
    return item.acao.replaceAll("_", " ");
  }
  return item.origem === "AUDITORIA" ? "Auditoria" : "Interação";
}

export function detalheTransicaoHistorico(item: PainelHistoricoItem): string | null {
  if (item.statusAnterior && item.statusNovo) {
    return `${item.statusAnterior} → ${item.statusNovo}`;
  }
  return null;
}
