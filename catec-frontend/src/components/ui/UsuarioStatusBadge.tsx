import StatusBadge, { StatusBadgeGroup } from "./StatusBadge";

export type UsuarioStatusBadgeProps = {
  requerTrocaSenha: boolean;
  ativo: boolean;
};

/** Status da conta na tabela de usuários — mesma `StatusBadge` base usada em projetos. */
export default function UsuarioStatusBadge({ requerTrocaSenha, ativo }: UsuarioStatusBadgeProps) {
  return (
    <StatusBadgeGroup>
      {requerTrocaSenha ? (
        <StatusBadge variant="pendente">Troca senha</StatusBadge>
      ) : ativo ? (
        <StatusBadge variant="ativo">Ativo</StatusBadge>
      ) : (
        <StatusBadge variant="inativo">Inativo</StatusBadge>
      )}
    </StatusBadgeGroup>
  );
}
