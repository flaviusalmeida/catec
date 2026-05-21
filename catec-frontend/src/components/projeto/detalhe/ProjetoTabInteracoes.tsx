import type { InteracaoTimelineItem } from "../../../hooks/useProjetoFluxoData";
import ProjetoTimeline from "./ProjetoTimeline";

type Props = {
  interacoes: InteracaoTimelineItem[];
  carregando?: boolean;
};

export default function ProjetoTabInteracoes({ interacoes, carregando }: Props) {
  if (carregando) {
    return <p className="proj-detalhe-loading">Carregando interações…</p>;
  }

  if (interacoes.length === 0) {
    return <p className="proj-detalhe-hint">Nenhuma interação com o cliente registrada ainda.</p>;
  }

  return <ProjetoTimeline items={interacoes} />;
}
