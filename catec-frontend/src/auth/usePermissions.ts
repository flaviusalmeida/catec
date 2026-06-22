import { useAuth } from "./AuthContext";

/** Atalho para checagens de permissão no UI. */
export function usePermissions() {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  return {
    permissoes: user?.permissoes ?? [],
    grupos: user?.grupos ?? [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
