import { describe, expect, it } from "vitest";
import { formatCep } from "./cep";

describe("formatCep", () => {
  it("aplica máscara com 8 dígitos", () => {
    expect(formatCep("01310100")).toBe("01310-100");
  });

  it("aceita valor já mascarado", () => {
    expect(formatCep("01310-100")).toBe("01310-100");
  });
});
