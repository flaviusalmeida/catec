import type { Contrato } from "../../../pages/contratoTypes";
import { STATUS_CONTRATO_ROTULO } from "../../../pages/contratoTypes";
import type { Proposta } from "../../../pages/propostaTypes";
import { STATUS_PROPOSTA_ROTULO } from "../../../pages/propostaTypes";
import type { Projeto } from "../../../pages/projetoTypes";
import { STATUS_PROJETO_ROTULO } from "../../../pages/projetoTypes";
import type { InteracaoTimelineItem } from "../../../hooks/useProjetoFluxoData";
import { DashboardCard } from "./detalheUi";

type Props = {
  projeto: Projeto;
  propostaAtual: Proposta | null;
  contrato: Contrato | null;
  ultimaInteracao: InteracaoTimelineItem | null;
};

export default function ProjetoResumoSidebar({ projeto, propostaAtual, contrato, ultimaInteracao }: Props) {
  return (
    <div className="proj-detalhe-sidebar__sticky">
      <DashboardCard title="Resumo" titleId="proj-resumo" variant="sidebar">
        <ul className="proj-detalhe-resumo-list">
          <li>
            <span className="proj-detalhe-resumo-list__label">Cliente</span>
            <span className="proj-detalhe-resumo-list__value">{projeto.clienteNome ?? "—"}</span>
          </li>
          <li>
            <span className="proj-detalhe-resumo-list__label">Projeto</span>
            <span className="proj-detalhe-resumo-list__value">{STATUS_PROJETO_ROTULO[projeto.status]}</span>
          </li>
          <li>
            <span className="proj-detalhe-resumo-list__label">Proposta</span>
            <span className="proj-detalhe-resumo-list__value">
              {propostaAtual ? STATUS_PROPOSTA_ROTULO[propostaAtual.status] : "—"}
            </span>
          </li>
          <li>
            <span className="proj-detalhe-resumo-list__label">Contrato</span>
            <span className="proj-detalhe-resumo-list__value">
              {contrato ? STATUS_CONTRATO_ROTULO[contrato.status] : "—"}
            </span>
          </li>
          {ultimaInteracao ? (
            <li>
              <span className="proj-detalhe-resumo-list__label">Última interação</span>
              <span className="proj-detalhe-resumo-list__value proj-detalhe-resumo-list__value--muted">
                {new Date(ultimaInteracao.criadoEm).toLocaleDateString("pt-BR")}
              </span>
            </li>
          ) : null}
        </ul>
      </DashboardCard>
    </div>
  );
}
