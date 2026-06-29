export type HistoricoFluxoItem = {
  origem: "AUDITORIA" | "INTERACAO";
  registroId: number;
  tipoEntidade: string;
  entidadeId: number;
  acao: string | null;
  statusAnterior: string | null;
  statusNovo: string | null;
  tipoInteracao: string | null;
  texto: string | null;
  documentoId: number | null;
  usuarioId: number;
  usuarioNome: string;
  ocorridoEm: string;
};
