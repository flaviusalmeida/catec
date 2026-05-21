export type PropostaStatus =
  | "RASCUNHO"
  | "PENDENTE_AVALIACAO_SOCIO"
  | "APROVADA_INTERNA"
  | "ENVIADA_AO_CLIENTE"
  | "EM_AVALIACAO_CLIENTE"
  | "AGUARDANDO_AJUSTE_ADM"
  | "ACEITA"
  | "NEGADA";

export type TipoInteracaoFluxo = "CONSIDERACOES_CLIENTE" | "ACEITE_CLIENTE" | "RECUSA_CLIENTE";

export type Proposta = {
  id: number;
  projetoId: number;
  status: PropostaStatus;
  versao: number;
  requerAvaliacaoSocio: boolean;
  elaboradoPorId: number;
  elaboradoPorNome: string;
  enviadaClienteEm: string | null;
  avaliadaSocioEm: string | null;
  avaliadaPorSocioId: number | null;
  consideracoesPendentes: boolean;
  cobrancaPropostaInicioEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type DocumentoAnexo = {
  id: number;
  tipoVinculo: string;
  vinculoId: number;
  tipoArquivo: string | null;
  nomeOriginal: string;
  mimeType: string;
  tamanhoBytes: number;
  versao: number;
  uploadedPorId: number;
  uploadedPorNome: string;
  criadoEm: string;
};

export type InteracaoFluxo = {
  id: number;
  tipoInteracao: TipoInteracaoFluxo;
  texto: string;
  registradoPorId: number;
  registradoPorNome: string;
  documentoId: number | null;
  criadoEm: string;
};

export type PropostaPendenteSocio = {
  propostaId: number;
  projetoId: number;
  projetoTitulo: string;
  clienteNome: string | null;
  versao: number;
  elaboradoPorNome: string;
  criadoEm: string;
};

export const STATUS_PROPOSTA_ROTULO: Record<PropostaStatus, string> = {
  RASCUNHO: "Rascunho",
  PENDENTE_AVALIACAO_SOCIO: "Pendente avaliação sócio",
  APROVADA_INTERNA: "Aprovada internamente",
  ENVIADA_AO_CLIENTE: "Enviada ao cliente",
  EM_AVALIACAO_CLIENTE: "Em avaliação do cliente",
  AGUARDANDO_AJUSTE_ADM: "Aguardando ajuste ADM",
  ACEITA: "Aceita pelo cliente",
  NEGADA: "Negada pelo cliente",
};

/** Rótulos no histórico e no modal de interação (proposta comercial). */
export const TIPO_INTERACAO_ROTULO_PROPOSTA: Record<TipoInteracaoFluxo, string> = {
  ACEITE_CLIENTE: "Proposta aceita",
  RECUSA_CLIENTE: "Proposta recusada",
  CONSIDERACOES_CLIENTE: "Ajustar proposta",
};

export const ORDEM_TIPO_INTERACAO: TipoInteracaoFluxo[] = [
  "ACEITE_CLIENTE",
  "RECUSA_CLIENTE",
  "CONSIDERACOES_CLIENTE",
];

export const STATUS_PROPOSTA_UPLOAD: PropostaStatus[] = [
  "RASCUNHO",
  "PENDENTE_AVALIACAO_SOCIO",
  "APROVADA_INTERNA",
];

export const STATUS_PROPOSTA_RESPOSTA_CLIENTE: PropostaStatus[] = [
  "ENVIADA_AO_CLIENTE",
  "EM_AVALIACAO_CLIENTE",
  "AGUARDANDO_AJUSTE_ADM",
];

/** Propostas já encaminhadas ao cliente (histórico de envio). */
export const STATUS_PROPOSTA_ENVIADA: PropostaStatus[] = [
  "ENVIADA_AO_CLIENTE",
  "EM_AVALIACAO_CLIENTE",
  "AGUARDANDO_AJUSTE_ADM",
  "ACEITA",
  "NEGADA",
];
