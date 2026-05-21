import ProjetoStatusBadge from "../ProjetoStatusBadge";
import type { Projeto } from "../../../pages/projetoTypes";
import { CollapsibleText, DashboardCard, InfoGrid, InfoItem } from "./detalheUi";

type Props = {
  projeto: Projeto;
};

export default function ProjetoTabGeral({ projeto }: Props) {
  return (
    <DashboardCard title="Dados gerais" titleId="tab-geral-dados">
      <InfoGrid>
        <InfoItem label="Cliente">{projeto.clienteNome ?? "—"}</InfoItem>
        <InfoItem label="Criado por">{projeto.criadoPorNome}</InfoItem>
        <InfoItem label="Status" valueClassName="proj-detalhe-info-item__value--status">
          <ProjetoStatusBadge status={projeto.status} />
        </InfoItem>
        <InfoItem label="E-mail">{projeto.emailContato ?? "—"}</InfoItem>
        <InfoItem label="Telefone">{projeto.telefoneContato ?? "—"}</InfoItem>
      </InfoGrid>
    </DashboardCard>
  );
}

export function ProjetoTabGeralEscopo({ projeto }: { projeto: Projeto }) {
  return (
    <DashboardCard title="Escopo da demanda" titleId="tab-geral-escopo" variant="escopo">
      <CollapsibleText text={projeto.escopo} />
    </DashboardCard>
  );
}
