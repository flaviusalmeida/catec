import type { HistoricoFluxoItem } from "../pages/historicoFluxoTypes";
import type { TipoInteracaoFluxo } from "../pages/propostaTypes";
import { TIPO_INTERACAO_ROTULO_PROPOSTA } from "../pages/propostaTypes";
import { TIPO_INTERACAO_ROTULO_CONTRATO } from "../pages/contratoTypes";
import { formatInstantBr } from "./dateTimeBr";

function rotuloTipoInteracao(tipo: string, tipoEntidade: string): string | null {
  const chave = tipo as TipoInteracaoFluxo;
  const entidade = tipoEntidade.toUpperCase();
  if (entidade === "CONTRATO" && chave in TIPO_INTERACAO_ROTULO_CONTRATO) {
    return TIPO_INTERACAO_ROTULO_CONTRATO[chave];
  }
  if (chave in TIPO_INTERACAO_ROTULO_PROPOSTA) {
    return TIPO_INTERACAO_ROTULO_PROPOSTA[chave];
  }
  return null;
}

function contextoHistoricoEntidade(item: HistoricoFluxoItem): string | null {
  const tipo = item.tipoEntidade?.trim().toLowerCase();
  if (!tipo) {
    return null;
  }
  return tipo;
}

export function rotuloHistoricoItem(item: HistoricoFluxoItem): string {
  if (item.origem === "INTERACAO" && item.tipoInteracao) {
    const rotulo = rotuloTipoInteracao(item.tipoInteracao, item.tipoEntidade);
    if (rotulo) {
      return rotulo;
    }
    return item.tipoInteracao.replaceAll("_", " ");
  }
  if (item.acao) {
    return item.acao.replaceAll("_", " ");
  }
  return item.origem === "AUDITORIA" ? "Auditoria" : "Interação";
}

export function detalheTransicaoHistorico(item: HistoricoFluxoItem): string | null {
  if (item.statusAnterior && item.statusNovo) {
    return `${item.statusAnterior} → ${item.statusNovo}`;
  }
  return null;
}

export function metaHistoricoItem(item: HistoricoFluxoItem): string {
  const partes = [item.usuarioNome, formatInstantBr(item.ocorridoEm)];
  const transicao = detalheTransicaoHistorico(item);
  if (transicao) {
    partes.push(transicao);
  } else {
    const contexto = contextoHistoricoEntidade(item);
    if (contexto) {
      partes.push(contexto);
    }
  }
  return partes.join(" · ");
}

export function textoHistoricoItem(item: HistoricoFluxoItem): string | null {
  return item.texto?.trim() || null;
}
