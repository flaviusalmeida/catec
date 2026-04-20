import { describe, expect, it } from "vitest";
import { isEmailValid } from "./emailFormat";

describe("isEmailValid", () => {
  it("aceita e-mails em formato usual", () => {
    expect(isEmailValid("joao.silva@empresa.com.br")).toBe(true);
    expect(isEmailValid("  a@b.co  ")).toBe(true);
  });

  it("rejeita formato incompleto", () => {
    expect(isEmailValid("semarroba")).toBe(false);
    expect(isEmailValid("a@b")).toBe(false);
    expect(isEmailValid("a@b.c")).toBe(false);
  });
});
