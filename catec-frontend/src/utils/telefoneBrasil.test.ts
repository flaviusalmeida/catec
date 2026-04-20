import { describe, expect, it } from "vitest";
import { formatTelefoneBrasil, isTelefoneBrasilValid } from "./telefoneBrasil";

describe("formatTelefoneBrasil", () => {
  it("formata celular com 11 dígitos", () => {
    expect(formatTelefoneBrasil("11987654321")).toBe("(11) 98765-4321");
  });

  it("formata fixo com 10 dígitos", () => {
    expect(formatTelefoneBrasil("1133334444")).toBe("(11) 3333-4444");
  });
});

describe("isTelefoneBrasilValid", () => {
  it("aceita 10 e 11 dígitos com DDD válido", () => {
    expect(isTelefoneBrasilValid("1133334444")).toBe(true);
    expect(isTelefoneBrasilValid("11987654321")).toBe(true);
  });

  it("rejeita quantidade incorreta ou DDD com zero", () => {
    expect(isTelefoneBrasilValid("0133334444")).toBe(false);
    expect(isTelefoneBrasilValid("119876543212")).toBe(false);
    expect(isTelefoneBrasilValid("1198765")).toBe(false);
  });
});
