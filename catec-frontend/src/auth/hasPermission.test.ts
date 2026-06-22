import { describe, expect, it } from "vitest";
import { hasAllPermissions, hasAnyPermission, hasPermission } from "./hasPermission";
import { PermissaoCodigo } from "./permissao";

describe("hasPermission", () => {
  const perms = [PermissaoCodigo.TELA_PAINEL, PermissaoCodigo.ACAO_PROJETO_CRIAR];

  it("hasPermission detecta código presente", () => {
    expect(hasPermission(perms, PermissaoCodigo.TELA_PAINEL)).toBe(true);
    expect(hasPermission(perms, PermissaoCodigo.TELA_GRUPOS)).toBe(false);
  });

  it("hasAnyPermission exige pelo menos um", () => {
    expect(hasAnyPermission(perms, [PermissaoCodigo.TELA_GRUPOS, PermissaoCodigo.TELA_PAINEL])).toBe(true);
    expect(hasAnyPermission(perms, [PermissaoCodigo.TELA_GRUPOS])).toBe(false);
  });

  it("hasAllPermissions exige todos", () => {
    expect(hasAllPermissions(perms, [PermissaoCodigo.TELA_PAINEL, PermissaoCodigo.ACAO_PROJETO_CRIAR])).toBe(true);
    expect(hasAllPermissions(perms, [PermissaoCodigo.TELA_PAINEL, PermissaoCodigo.TELA_GRUPOS])).toBe(false);
  });
});
