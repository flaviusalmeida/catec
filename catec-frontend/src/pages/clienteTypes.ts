export type TipoPessoa = "PF" | "PJ";

export type Cliente = {
  id: number;
  tipoPessoa: TipoPessoa;
  razaoSocialOuNome: string;
  nomeFantasia: string | null;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  enderecoLogradouro: string | null;
  enderecoCidade: string | null;
  enderecoUf: string | null;
  enderecoCep: string | null;
  observacoes: string | null;
};

export type ClienteFormState = {
  tipoPessoa: TipoPessoa;
  razaoSocialOuNome: string;
  nomeFantasia: string;
  documento: string;
  email: string;
  telefone: string;
  enderecoLogradouro: string;
  enderecoCidade: string;
  enderecoUf: string;
  enderecoCep: string;
  observacoes: string;
};

export const EMPTY_CLIENTE_FORM: ClienteFormState = {
  tipoPessoa: "PF",
  razaoSocialOuNome: "",
  nomeFantasia: "",
  documento: "",
  email: "",
  telefone: "",
  enderecoLogradouro: "",
  enderecoCidade: "",
  enderecoUf: "",
  enderecoCep: "",
  observacoes: "",
};

export function clienteToFormState(c: Cliente): ClienteFormState {
  return {
    tipoPessoa: c.tipoPessoa,
    razaoSocialOuNome: c.razaoSocialOuNome,
    nomeFantasia: c.nomeFantasia ?? "",
    documento: c.documento ?? "",
    email: c.email ?? "",
    telefone: c.telefone ?? "",
    enderecoLogradouro: c.enderecoLogradouro ?? "",
    enderecoCidade: c.enderecoCidade ?? "",
    enderecoUf: c.enderecoUf ?? "",
    enderecoCep: c.enderecoCep ?? "",
    observacoes: c.observacoes ?? "",
  };
}
