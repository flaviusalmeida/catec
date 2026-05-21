export type ProjetoTimelineEntry = {
  key: string;
  titulo: string;
  meta: string;
  texto?: string | null;
};

type Props = {
  items: ProjetoTimelineEntry[];
  busy?: boolean;
};

export default function ProjetoTimeline({ items, busy }: Props) {
  return (
    <ul className="proj-detalhe-timeline" aria-busy={busy}>
      {items.map((item) => (
        <li key={item.key} className="proj-detalhe-timeline__item">
          <p className="proj-detalhe-timeline__titulo">{item.titulo}</p>
          <span className="proj-detalhe-timeline__meta">{item.meta}</span>
          {item.texto?.trim() ? <p className="proj-detalhe-timeline__texto">{item.texto}</p> : null}
        </li>
      ))}
    </ul>
  );
}
