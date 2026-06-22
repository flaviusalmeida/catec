import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { hasAllPermissions, hasAnyPermission } from "./hasPermission";

export type CanPermissionProps = {
  children: ReactNode;
  /** Exibe `children` se o usuário tiver pelo menos uma destas permissões. */
  anyOf?: readonly string[];
  /** Exibe `children` se o usuário tiver todas estas permissões. */
  allOf?: readonly string[];
  /** Uma única permissão (atalho). */
  code?: string;
  fallback?: ReactNode;
};

export default function CanPermission({
  children,
  anyOf,
  allOf,
  code,
  fallback = null,
}: CanPermissionProps) {
  const { user } = useAuth();
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

  return allowed ? <>{children}</> : <>{fallback}</>;
}
