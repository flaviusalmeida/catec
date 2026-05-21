import type { InteracaoTimelineItem } from "../../../hooks/useProjetoFluxoData";

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

  return (
    <ul className="proj-detalhe-timeline">
      {interacoes.map((i) => (
        <li key={i.key} className="proj-detalhe-timeline__item">
          <p className="proj-detalhe-timeline__titulo">{i.titulo}</p>
          <span className="proj-detalhe-timeline__meta">{i.meta}</span>
          <p className="proj-detalhe-timeline__texto">{i.texto}</p>
        </li>
      ))}
    </ul>
  );
}
