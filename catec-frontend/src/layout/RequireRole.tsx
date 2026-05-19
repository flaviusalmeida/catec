import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { hasAllRoles, hasAnyRole } from "../auth/hasRole";
import type { PerfilCodigo } from "../auth/perfil";
import AccessDeniedCard from "../components/ui/AccessDeniedCard";
import "./RequireAuth.css";

export type RequireRoleProps = {
  children: ReactNode;
  anyOf?: readonly PerfilCodigo[];
  allOf?: readonly PerfilCodigo[];
  title?: string;
  message?: string;
};

/**
 * Guard de rota por perfil. Usar dentro de {@link RequireAuth}.
 * Quem não tiver perfil vê cartão de acesso negado (não redirecciona para login).
 */
export default function RequireRole({
  children,
  anyOf,
  allOf,
  title = "Acesso restrito",
  message = "O seu perfil não tem permissão para aceder a esta área. As operações sensíveis continuam validadas pela API.",
}: RequireRoleProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="require-auth-loading">
        <p>Carregando…</p>
      </div>
    );
  }

  const perfis = user?.perfis;
  let allowed = false;
  if (anyOf?.length) {
    allowed = hasAnyRole(perfis, anyOf);
  } else if (allOf?.length) {
    allowed = hasAllRoles(perfis, allOf);
  } else {
    allowed = true;
  }

  if (!allowed) {
    return <AccessDeniedCard title={title} message={message} />;
  }

  return <>{children}</>;
}
