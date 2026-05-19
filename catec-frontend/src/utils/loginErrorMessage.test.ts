import { describe, expect, it } from "vitest";
import { mensagemErroLogin } from "./loginErrorMessage";

describe("mensagemErroLogin", () => {
  it("usa mensagem da API quando existir", () => {
    expect(mensagemErroLogin(401, { mensagem: "Credenciais inválidas." })).toBe("Credenciais inválidas.");
  });

  it("mapeia 403 para conta inativa", () => {
    expect(mensagemErroLogin(403, null)).toContain("inativa");
  });

  it("mapeia 401 sem body", () => {
    expect(mensagemErroLogin(401, null)).toContain("incorretos");
  });
});
