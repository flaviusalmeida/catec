import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api/http";
import { mensagemErroApi } from "../utils/apiError";
import type { Contrato } from "../pages/contratoTypes";
import { STATUS_CONTRATO_ROTULO, TIPO_INTERACAO_ROTULO_CONTRATO } from "../pages/contratoTypes";
import type { InteracaoFluxo, Proposta, TipoInteracaoFluxo } from "../pages/propostaTypes";
import {
  STATUS_PROPOSTA_RESPOSTA_CLIENTE,
  STATUS_PROPOSTA_ROTULO,
  TIPO_INTERACAO_ROTULO_PROPOSTA,
  type PropostaStatus,
} from "../pages/propostaTypes";

const STATUS_PROPOSTA_ATIVA: PropostaStatus[] = [
  "RASCUNHO",
  "PENDENTE_AVALIACAO_SOCIO",
  "APROVADA_INTERNA",
];
import type { Projeto } from "../pages/projetoTypes";

export type InteracaoTimelineItem = {
  key: string;
  titulo: string;
  meta: string;
  texto: string;
  criadoEm: string;
};

function rotuloInteracao(tipo: TipoInteracaoFluxo, origem: "PROPOSTA" | "CONTRATO"): string {
  return origem === "CONTRATO" ? TIPO_INTERACAO_ROTULO_CONTRATO[tipo] : TIPO_INTERACAO_ROTULO_PROPOSTA[tipo];
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export function useProjetoFluxoData(projetoId: number, refreshKey: number, logout: () => void) {
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [interacoes, setInteracoes] = useState<InteracaoTimelineItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!Number.isFinite(projetoId) || projetoId < 1) {
      setErro("Projeto inválido.");
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const [resProj, resProp, resCont] = await Promise.all([
        apiFetch(`/api/v1/projetos/${projetoId}`),
        apiFetch(`/api/v1/projetos/${projetoId}/propostas`),
        apiFetch(`/api/v1/projetos/${projetoId}/contratos`),
      ]);

      if (resProj.status === 401) {
        logout();
        return;
      }
      if (!resProj.ok) {
        setErro(await mensagemErroApi(resProj, "Erro ao carregar projeto"));
        return;
      }

      const proj = (await resProj.json()) as Projeto;
      const listaProp: Proposta[] = resProp.ok ? ((await resProp.json()) as Proposta[]) : [];
      const listaCont: Contrato[] = resCont.ok ? ((await resCont.json()) as Contrato[]) : [];
      const cont = listaCont[0] ?? null;

      setProjeto(proj);
      setPropostas(listaProp);
      setContrato(cont);

      const timeline: InteracaoTimelineItem[] = [];

      for (const p of listaProp) {
        const resInt = await apiFetch(`/api/v1/projetos/${projetoId}/propostas/${p.id}/interacoes`);
        const ints: InteracaoFluxo[] = resInt.ok ? ((await resInt.json()) as InteracaoFluxo[]) : [];

        for (const i of ints) {
          timeline.push({
            key: `P-${i.id}`,
            titulo: rotuloInteracao(i.tipoInteracao, "PROPOSTA"),
            meta: `${i.registradoPorNome} · ${formatarDataHora(i.criadoEm)} · proposta v${p.versao}`,
            texto: i.texto,
            criadoEm: i.criadoEm,
          });
        }
      }

      if (cont) {
        const resInt = await apiFetch(`/api/v1/projetos/${projetoId}/contratos/${cont.id}/interacoes`);
        const ints: InteracaoFluxo[] = resInt.ok ? ((await resInt.json()) as InteracaoFluxo[]) : [];

        for (const i of ints) {
          timeline.push({
            key: `C-${i.id}`,
            titulo: rotuloInteracao(i.tipoInteracao, "CONTRATO"),
            meta: `${i.registradoPorNome} · ${formatarDataHora(i.criadoEm)} · contrato`,
            texto: i.texto,
            criadoEm: i.criadoEm,
          });
        }
      }

      timeline.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

      setInteracoes(timeline);
    } catch {
      setErro("Falha de rede ao carregar dados do projeto.");
    } finally {
      setCarregando(false);
    }
  }, [projetoId, logout]);

  useEffect(() => {
    void carregar();
  }, [carregar, refreshKey]);

  const propostaAtual = propostas[0] ?? null;
  const propostaParaRegistro =
    propostas.find((p) => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null;
  const contratoParaRegistro =
    contrato && (contrato.status === "ENVIADO_AO_CLIENTE" || contrato.status === "AGUARDANDO_AJUSTE_ADM")
      ? contrato
      : null;

  const temPropostaAtiva = propostas.some((p) => STATUS_PROPOSTA_ATIVA.includes(p.status));
  const aguardandoAjusteCliente = propostas.some(
    (p) => p.status === "AGUARDANDO_AJUSTE_ADM" || p.consideracoesPendentes,
  );
  const podeCriarNovaProposta =
    projeto?.clienteId != null &&
    !temPropostaAtiva &&
    (propostas.length === 0 || aguardandoAjusteCliente);
  const podeRegistrarInteracao = propostaParaRegistro != null || contratoParaRegistro != null;

  return {
    projeto,
    propostas,
    propostaAtual,
    contrato,
    interacoes,
    propostaParaRegistro,
    contratoParaRegistro,
    carregando,
    erro,
    recarregar: carregar,
    rotuloProposta: propostaAtual ? STATUS_PROPOSTA_ROTULO[propostaAtual.status] : "—",
    rotuloContrato: contrato ? STATUS_CONTRATO_ROTULO[contrato.status] : "—",
    ultimaInteracao: interacoes[0] ?? null,
    podeCriarNovaProposta,
    podeRegistrarInteracao,
  };
}
