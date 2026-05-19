import { describe, expect, it } from "vitest";
import { hasAllRoles, hasAnyRole, hasRole } from "./hasRole";

describe("hasRole", () => {
  it("hasRole detecta perfil presente", () => {
    expect(hasRole(["COLABORADOR", "ADMINISTRATIVO"], "ADMINISTRATIVO")).toBe(true);
    expect(hasRole(["COLABORADOR"], "SOCIO")).toBe(false);
  });

  it("hasAnyRole exige pelo menos um", () => {
    expect(hasAnyRole(["SOCIO"], ["COLABORADOR", "SOCIO"])).toBe(true);
    expect(hasAnyRole(["COLABORADOR"], ["ADMINISTRATIVO"])).toBe(false);
  });

  it("hasAllRoles exige todos", () => {
    expect(hasAllRoles(["ADMINISTRATIVO", "COLABORADOR"], ["ADMINISTRATIVO", "COLABORADOR"])).toBe(true);
    expect(hasAllRoles(["COLABORADOR"], ["ADMINISTRATIVO", "COLABORADOR"])).toBe(false);
  });
});
