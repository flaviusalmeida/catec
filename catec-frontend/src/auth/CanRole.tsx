import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { hasAllRoles, hasAnyRole } from "./hasRole";
import type { PerfilCodigo } from "./perfil";

export type CanRoleProps = {
  children: ReactNode;
  /** Exibe `children` se o usuário tiver pelo menos um destes perfis. */
  anyOf?: readonly PerfilCodigo[];
  /** Exibe `children` se o usuário tiver todos estes perfis. */
  allOf?: readonly PerfilCodigo[];
  /** Conteúdo alternativo quando não autorizado (por defeito: nada). */
  fallback?: ReactNode;
};

/**
 * Renderização condicional por perfil (MVP: ocultar UI).
 * A autorização efectiva continua no backend.
 */
export default function CanRole({ children, anyOf, allOf, fallback = null }: CanRoleProps) {
  const { user } = useAuth();
  const perfis = user?.perfis;

  let allowed = false;
  if (anyOf?.length) {
    allowed = hasAnyRole(perfis, anyOf);
  } else if (allOf?.length) {
    allowed = hasAllRoles(perfis, allOf);
  } else {
    allowed = true;
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}
