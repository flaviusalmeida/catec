import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { hasAllPermissions, hasAnyPermission } from "../auth/hasPermission";
import AccessDeniedCard from "../components/ui/AccessDeniedCard";
import "./RequireAuth.css";

export type RequirePermissionProps = {
  children: ReactNode;
  anyOf?: readonly string[];
  allOf?: readonly string[];
  code?: string;
  title?: string;
  message?: string;
};

export default function RequirePermission({
  children,
  anyOf,
  allOf,
  code,
  title = "Acesso restrito",
  message = "O seu perfil não tem permissão para aceder a esta área. As operações sensíveis continuam validadas pela API.",
}: RequirePermissionProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="require-auth-loading">
        <p>Carregando…</p>
      </div>
    );
  }

  const permissoes = user?.permissoes;
  let allowed = false;
  if (code) {
    allowed = permissoes?.includes(code) ?? false;
  } else if (anyOf?.length) {
    allowed = hasAnyPermission(permissoes, anyOf);
  } else if (allOf?.length) {
    allowed = hasAllPermissions(permissoes, allOf);
  } else {
    allowed = true;
  }

  if (!allowed) {
    return <AccessDeniedCard title={title} message={message} />;
  }

  return <>{children}</>;
}
