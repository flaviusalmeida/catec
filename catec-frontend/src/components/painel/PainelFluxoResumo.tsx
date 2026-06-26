import type { PainelIndicadores } from "../../pages/painelTypes";
import "./PainelFluxoResumo.css";

export type PainelFluxoResumoProps = {
  indicadores: PainelIndicadores | null;
  carregando?: boolean;
};

const ETAPAS: {
  key: keyof Pick<
    PainelIndicadores,
    "etapaProposta" | "etapaAvaliacaoSocio" | "etapaContrato" | "etapaExecucao"
  >;
  label: string;
}[] = [
  { key: "etapaProposta", label: "Proposta" },
  { key: "etapaAvaliacaoSocio", label: "Avaliação do sócio" },
  { key: "etapaContrato", label: "Contrato" },
  { key: "etapaExecucao", label: "Execução" },
];

export default function PainelFluxoResumo({ indicadores, carregando = false }: PainelFluxoResumoProps) {
  return (
    <section className="painel-fluxo-resumo" aria-labelledby="painel-fluxo-titulo">
      <h2 id="painel-fluxo-titulo" className="painel-fluxo-resumo__titulo">
        Resumo do fluxo comercial
      </h2>
      <div className="painel-fluxo-resumo__cards" aria-busy={carregando}>
        {ETAPAS.map((etapa) => {
          const count = indicadores?.[etapa.key] ?? 0;
          return (
            <article key={etapa.key} className="painel-fluxo-resumo__card">
              <h3 className="painel-fluxo-resumo__card-label">{etapa.label}</h3>
              <p className="painel-fluxo-resumo__card-count">
                {count} {count === 1 ? "projeto" : "projetos"}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
