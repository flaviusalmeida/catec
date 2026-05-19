import type { FaseMacro, PainelIndicadores } from "../../pages/painelTypes";
import PainelIndicadorCard from "./PainelIndicadorCard";
import "./PainelIndicadoresGrid.css";

export type PainelIndicadoresGridProps = {
  indicadores: PainelIndicadores | null;
  carregando?: boolean;
  faseMacroAtiva?: "" | FaseMacro;
  onFiltrarFase?: (fase: FaseMacro) => void;
};

type IndicadorConfig = {
  key: keyof PainelIndicadores;
  label: string;
  fase: FaseMacro;
  hint?: string;
};

const INDICADORES: IndicadorConfig[] = [
  { key: "projetosPendentesCliente", label: "Projetos sem cliente", fase: "PENDENTE_CLIENTE" },
  {
    key: "propostasEmRascunho",
    label: "Propostas em rascunho",
    fase: "ELABORACAO_PROPOSTA",
  },
  {
    key: "propostasAguardandoAvaliacaoSocio",
    label: "Aguardando avaliação do sócio",
    fase: "AVALIACAO_SOCIO",
  },
  {
    key: "propostasAprovadasAguardandoEnvio",
    label: "Aprovadas — aguardando envio",
    fase: "APROVADA_AGUARDANDO_ENVIO",
  },
  {
    key: "propostasAguardandoRegistroCliente",
    label: "Aguardando registro do cliente",
    fase: "AGUARDANDO_RESPOSTA_CLIENTE",
    hint: "Enviadas / em avaliação",
  },
];

export default function PainelIndicadoresGrid({
  indicadores,
  carregando = false,
  faseMacroAtiva = "",
  onFiltrarFase,
}: PainelIndicadoresGridProps) {
  return (
    <section className="painel-indicadores-grid" aria-labelledby="painel-indicadores-titulo">
      <h2 id="painel-indicadores-titulo" className="painel-indicadores-grid__titulo">
        Indicadores
      </h2>
      <div className="painel-indicadores-grid__cards" aria-busy={carregando}>
        {INDICADORES.map((cfg) => (
          <PainelIndicadorCard
            key={cfg.key}
            label={cfg.label}
            value={indicadores?.[cfg.key] ?? 0}
            hint={cfg.hint}
            active={faseMacroAtiva === cfg.fase}
            onClick={onFiltrarFase ? () => onFiltrarFase(cfg.fase) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
