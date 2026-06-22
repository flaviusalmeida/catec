export function hasPermission(
  permissoes: readonly string[] | undefined | null,
  codigo: string,
): boolean {
  return permissoes?.includes(codigo) ?? false;
}

export function hasAnyPermission(
  permissoes: readonly string[] | undefined | null,
  codigos: readonly string[],
): boolean {
  if (!permissoes?.length || !codigos.length) {
    return false;
  }
  return codigos.some((c) => permissoes.includes(c));
}

export function hasAllPermissions(
  permissoes: readonly string[] | undefined | null,
  codigos: readonly string[],
): boolean {
  if (!codigos.length) {
    return true;
  }
  return codigos.every((c) => permissoes?.includes(c) ?? false);
}
