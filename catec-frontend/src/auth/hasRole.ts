import type { PerfilCodigo } from "./perfil";

export function hasRole(perfis: readonly string[] | undefined | null, role: PerfilCodigo): boolean {
  return perfis?.includes(role) ?? false;
}

export function hasAnyRole(
  perfis: readonly string[] | undefined | null,
  roles: readonly PerfilCodigo[],
): boolean {
  if (!perfis?.length || !roles.length) {
    return false;
  }
  return roles.some((r) => perfis.includes(r));
}

export function hasAllRoles(
  perfis: readonly string[] | undefined | null,
  roles: readonly PerfilCodigo[],
): boolean {
  if (!roles.length) {
    return true;
  }
  return roles.every((r) => perfis?.includes(r) ?? false);
}
