import type { ProjetoStatus } from "./projetoTypes";
import type { PropostaStatus } from "./propostaTypes";

export type FaseMacro =
  | "PENDENTE_CLIENTE"
  | "AGUARDANDO_INICIO_PROPOSTA"
  | "ELABORACAO_PROPOSTA"
  | "AVALIACAO_SOCIO"
  | "APROVADA_AGUARDANDO_ENVIO"
  | "AGUARDANDO_RESPOSTA_CLIENTE"
  | "AVALIACAO_CLIENTE"
  | "AGUARDANDO_AJUSTE_INTERNO"
  | "AGUARDANDO_CONTRATO"
  | "AGUARDANDO_EXECUCAO"
  | "EM_EXECUCAO"
  | "ENCERRADA_ACEITA"
  | "ENCERRADA_NEGADA"
  | "PROPOSTA_CONCLUIDA";

export const FASE_MACRO_ROTULO: Record<FaseMacro, string> = {
  PENDENTE_CLIENTE: "Pendente de cliente",
  AGUARDANDO_INICIO_PROPOSTA: "Aguardando início da proposta",
  ELABORACAO_PROPOSTA: "Elaboração da proposta",
  AVALIACAO_SOCIO: "Avaliação do sócio",
  APROVADA_AGUARDANDO_ENVIO: "Aprovada — aguardando envio",
  AGUARDANDO_RESPOSTA_CLIENTE: "Aguardando resposta do cliente",
  AVALIACAO_CLIENTE: "Em avaliação pelo cliente",
  AGUARDANDO_AJUSTE_INTERNO: "Aguardando ajuste interno",
  AGUARDANDO_CONTRATO: "Aguardando contrato",
  AGUARDANDO_EXECUCAO: "Aguardando execução",
  EM_EXECUCAO: "Em execução",
  ENCERRADA_ACEITA: "Encerrada — aceita",
  ENCERRADA_NEGADA: "Encerrada — negada",
  PROPOSTA_CONCLUIDA: "Proposta concluída (projeto)",
};

/** Rótulos curtos para badges na listagem do painel (detalhe em `title`). */
export const FASE_MACRO_ROTULO_CURTO: Record<FaseMacro, string> = {
  PENDENTE_CLIENTE: "Sem cliente",
  AGUARDANDO_INICIO_PROPOSTA: "Aguardando proposta",
  ELABORACAO_PROPOSTA: "Em proposta",
  AVALIACAO_SOCIO: "Em avaliação",
  APROVADA_AGUARDANDO_ENVIO: "Aguardando envio",
  AGUARDANDO_RESPOSTA_CLIENTE: "Aguardando cliente",
  AVALIACAO_CLIENTE: "Em avaliação",
  AGUARDANDO_AJUSTE_INTERNO: "Ajuste interno",
  AGUARDANDO_CONTRATO: "Aguardando contrato",
  AGUARDANDO_EXECUCAO: "Aguardando execução",
  EM_EXECUCAO: "Em execução",
  ENCERRADA_ACEITA: "Encerrada (aceita)",
  ENCERRADA_NEGADA: "Encerrada (negada)",
  PROPOSTA_CONCLUIDA: "Proposta concluída",
};

export const FASE_MACRO_OPCOES: { value: FaseMacro; label: string }[] = (
  Object.keys(FASE_MACRO_ROTULO) as FaseMacro[]
).map((value) => ({ value, label: FASE_MACRO_ROTULO[value] }));

export type PainelProjetoResumo = {
  projetoId: number;
  titulo: string;
  clienteId: number | null;
  clienteNome: string | null;
  projetoStatus: ProjetoStatus;
  faseMacro: FaseMacro;
  propostaId: number | null;
  propostaVersao: number | null;
  propostaStatus: PropostaStatus | null;
  atualizadoEm: string;
  prazoReferencia: string;
};

export type PainelIndicadores = {
  projetosPendentesCliente: number;
  propostasAguardandoRegistroCliente: number;
  propostasAguardandoAvaliacaoSocio: number;
  propostasAprovadasAguardandoEnvio: number;
  propostasEmRascunho: number;
  etapaProposta: number;
  etapaAvaliacaoSocio: number;
  etapaContrato: number;
  etapaExecucao: number;
};

export type PainelHistoricoItem = {
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

export type PainelFiltrosState = {
  clienteId: string;
  clienteNome: string;
  faseMacro: "" | FaseMacro;
  prazoAte: string;
};

export const PAINEL_FILTROS_VAZIOS: PainelFiltrosState = {
  clienteId: "",
  clienteNome: "",
  faseMacro: "",
  prazoAte: "",
};
