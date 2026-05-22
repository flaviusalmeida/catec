import type { DocumentoAnexo } from "../pages/propostaTypes";

/** Documento de maior versão no vínculo (lista da API vem por versão desc). */
export function documentoMaisRecente(docs: DocumentoAnexo[]): DocumentoAnexo | null {
  if (docs.length === 0) return null;
  return [...docs].sort((a, b) => b.versao - a.versao)[0] ?? null;
}

/** Em rascunho há um único slot; exibe só o mais recente (dados legados com várias versões). */
export function documentosParaExibicao(
  docs: DocumentoAnexo[],
  modoSubstituir: boolean,
): DocumentoAnexo[] {
  if (docs.length === 0) return [];
  const sorted = [...docs].sort((a, b) => b.versao - a.versao);
  return modoSubstituir ? [sorted[0]] : sorted;
}
