import { describe, expect, it } from "vitest";
import { isCnpjValid, isCpfValid, validateClienteObrigatorios } from "./cpfCnpj";

describe("isCpfValid", () => {
  it("aceita CPF com dígitos verificadores corretos", () => {
    expect(isCpfValid("52998224725")).toBe(true);
  });

  it("rejeita CPF com DV incorreto", () => {
    expect(isCpfValid("52998224724")).toBe(false);
  });

  it("rejeita sequência repetida", () => {
    expect(isCpfValid("11111111111")).toBe(false);
  });
});

describe("isCnpjValid", () => {
  it("aceita CNPJ com dígitos verificadores corretos", () => {
    expect(isCnpjValid("11444777000161")).toBe(true);
  });

  it("rejeita CNPJ com DV incorreto", () => {
    expect(isCnpjValid("11444777000160")).toBe(false);
  });
});

const responsavelValido = {
  nome: "Maria Responsável",
  email: "maria@empresa.com",
  telefone: "(11) 97777-6666",
};

const periodoFaturamentoValido = "Até todo dia 15";

describe("validateClienteObrigatorios", () => {
  it("retorna mensagem quando CPF é inválido", () => {
    expect(
      validateClienteObrigatorios({
        tipoPessoa: "PF",
        razaoSocialOuNome: "Nome",
        documento: "529.982.247-24",
        email: "a@b.com",
        telefone: "(11) 99999-9999",
        periodoFaturamento: periodoFaturamentoValido,
        responsavel: responsavelValido,
      }),
    ).toBe("CPF inválido.");
  });

  it("retorna mensagem quando telefone está incompleto", () => {
    expect(
      validateClienteObrigatorios({
        tipoPessoa: "PF",
        razaoSocialOuNome: "Nome",
        documento: "529.982.247-25",
        email: "a@b.com",
        telefone: "(11) 9888",
        periodoFaturamento: periodoFaturamentoValido,
        responsavel: responsavelValido,
      }),
    ).toMatch(/Telefone inválido/);
  });

  it("retorna mensagem quando e-mail não atende ao formato", () => {
    expect(
      validateClienteObrigatorios({
        tipoPessoa: "PF",
        razaoSocialOuNome: "Nome",
        documento: "529.982.247-25",
        email: "invalido",
        telefone: "(11) 98888-8888",
        periodoFaturamento: periodoFaturamentoValido,
        responsavel: responsavelValido,
      }),
    ).toBe("Informe um e-mail válido.");
  });

  it("retorna mensagem quando nome do responsável está vazio", () => {
    expect(
      validateClienteObrigatorios({
        tipoPessoa: "PF",
        razaoSocialOuNome: "Nome",
        documento: "529.982.247-25",
        email: "a@b.com",
        telefone: "(11) 98888-8888",
        periodoFaturamento: periodoFaturamentoValido,
        responsavel: { ...responsavelValido, nome: "" },
      }),
    ).toBe("Nome do responsável é obrigatório.");
  });

  it("retorna mensagem quando período de faturamento está vazio", () => {
    expect(
      validateClienteObrigatorios({
        tipoPessoa: "PF",
        razaoSocialOuNome: "Nome",
        documento: "529.982.247-25",
        email: "a@b.com",
        telefone: "(11) 98888-8888",
        periodoFaturamento: "",
        responsavel: responsavelValido,
      }),
    ).toBe("Período de faturamento é obrigatório.");
  });
});
