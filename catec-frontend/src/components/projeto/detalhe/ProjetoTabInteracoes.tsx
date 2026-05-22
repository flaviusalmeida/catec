import type { InteracaoTimelineItem } from "../../../hooks/useProjetoFluxoData";
import ProjetoTimeline from "./ProjetoTimeline";
import StateCard from "../../ui/StateCard";
import { STATE_EMPTY_INTERACAO } from "./stateMessages";
import TabSectionHeader from "./TabSectionHeader";

type Props = {
  interacoes: InteracaoTimelineItem[];
  carregando?: boolean;
  podeRegistrar?: boolean;
  onRegistrar?: () => void;
};

export default function ProjetoTabInteracoes({
  interacoes,
  carregando,
  podeRegistrar = false,
  onRegistrar,
}: Props) {
  return (
    <section className="proj-detalhe-tab-section" aria-labelledby="proj-tab-interacoes-titulo">
      <TabSectionHeader
        titleId="proj-tab-interacoes-titulo"
        title="Interações com cliente"
        actionAriaLabel="Adicionar interação com cliente"
        onAction={onRegistrar}
        hideAction={!podeRegistrar}
      />

      {carregando ? (
        <p className="proj-detalhe-loading">Carregando interações…</p>
      ) : interacoes.length === 0 ? (
        <StateCard type="empty" title={STATE_EMPTY_INTERACAO} />
      ) : (
        <ProjetoTimeline items={interacoes} />
      )}
    </section>
  );
}
