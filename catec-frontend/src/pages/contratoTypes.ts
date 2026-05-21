import type { TipoInteracaoFluxo } from "./propostaTypes";

export type ContratoStatus =
  | "RASCUNHO"
  | "ENVIADO_AO_CLIENTE"
  | "AGUARDANDO_AJUSTE_ADM"
  | "ACEITO"
  | "RECUSADO";

export type Contrato = {
  id: number;
  projetoId: number;
  status: ContratoStatus;
  elaboradoPorId: number;
  elaboradoPorNome: string;
  enviadoClienteEm: string | null;
  aceitoClienteEm: string | null;
  recusadoClienteEm: string | null;
  consideracoesPendentes: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export const STATUS_CONTRATO_ROTULO: Record<ContratoStatus, string> = {
  RASCUNHO: "Em elaboração",
  ENVIADO_AO_CLIENTE: "Enviado ao cliente",
  AGUARDANDO_AJUSTE_ADM: "Aguardando ajuste ADM",
  ACEITO: "Aceito pelo cliente",
  RECUSADO: "Recusado pelo cliente",
};

export const STATUS_CONTRATO_UPLOAD: ContratoStatus[] = ["RASCUNHO", "AGUARDANDO_AJUSTE_ADM"];

/** Contrato aguardando registro da resposta do cliente. */
export const STATUS_CONTRATO_INTERACAO_CLIENTE: ContratoStatus[] = [
  "ENVIADO_AO_CLIENTE",
  "AGUARDANDO_AJUSTE_ADM",
];

/** Contrato já encaminhado ao cliente (histórico de interações). */
export const STATUS_CONTRATO_ENVIADO: ContratoStatus[] = [
  "ENVIADO_AO_CLIENTE",
  "AGUARDANDO_AJUSTE_ADM",
  "ACEITO",
  "RECUSADO",
];

export type { TipoInteracaoFluxo };

/** Rótulos no histórico e no modal de interação (contrato). */
export const TIPO_INTERACAO_ROTULO_CONTRATO: Record<TipoInteracaoFluxo, string> = {
  ACEITE_CLIENTE: "Contrato aceito",
  RECUSA_CLIENTE: "Contrato recusado",
  CONSIDERACOES_CLIENTE: "Ajustar contrato",
};
