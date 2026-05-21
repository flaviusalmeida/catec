import TextLinkButton from "../../buttons/TextLinkButton";
import ProjetoStatusBadge from "../ProjetoStatusBadge";
import type { Projeto } from "../../../pages/projetoTypes";
import { CollapsibleText, DashboardCard, InfoGrid, InfoItem } from "./detalheUi";

type Props = {
  projeto: Projeto;
  isAdmin: boolean;
  onEditarCliente: () => void;
};

export default function ProjetoTabGeral({ projeto, isAdmin, onEditarCliente }: Props) {
  return (
    <DashboardCard title="Dados gerais" titleId="tab-geral-dados">
      <InfoGrid>
        <InfoItem label="Cliente">{projeto.clienteNome ?? "—"}</InfoItem>
        <InfoItem label="Criado por">{projeto.criadoPorNome}</InfoItem>
        <InfoItem label="Status">
          <ProjetoStatusBadge status={projeto.status} />
        </InfoItem>
        <InfoItem label="E-mail">{projeto.emailContato ?? "—"}</InfoItem>
        <InfoItem label="Telefone">{projeto.telefoneContato ?? "—"}</InfoItem>
      </InfoGrid>
      {isAdmin && projeto.clienteId != null ? (
        <p className="proj-detalhe-link-cliente">
          <TextLinkButton onClick={onEditarCliente}>Editar cadastro do cliente</TextLinkButton>
        </p>
      ) : null}
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
