import { formatCep } from "../utils/cep";
import { onlyDigits } from "../utils/digitsOnly";
import { formatDocumentoByTipo, type TipoPessoa } from "../utils/cpfCnpj";
import { formatTelefoneBrasil } from "../utils/telefoneBrasil";

export type { TipoPessoa };

export type Cliente = {
  id: number;
  tipoPessoa: TipoPessoa;
  razaoSocialOuNome: string;
  nomeFantasia: string | null;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  enderecoLogradouro: string | null;
  enderecoNumero: string | null;
  enderecoComplemento: string | null;
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
  enderecoNumero: string;
  enderecoComplemento: string;
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
  enderecoNumero: "",
  enderecoComplemento: "",
  enderecoCidade: "",
  enderecoUf: "",
  enderecoCep: "",
  observacoes: "",
};

export function clienteToFormState(c: Cliente): ClienteFormState {
  const docDigits = onlyDigits(c.documento ?? "");
  const telDigits = onlyDigits(c.telefone ?? "");
  return {
    tipoPessoa: c.tipoPessoa,
    razaoSocialOuNome: c.razaoSocialOuNome,
    nomeFantasia: c.nomeFantasia ?? "",
    documento: docDigits ? formatDocumentoByTipo(c.tipoPessoa, docDigits) : "",
    email: c.email ?? "",
    telefone: telDigits ? formatTelefoneBrasil(telDigits) : "",
    enderecoLogradouro: c.enderecoLogradouro ?? "",
    enderecoNumero: c.enderecoNumero ?? "",
    enderecoComplemento: c.enderecoComplemento ?? "",
    enderecoCidade: c.enderecoCidade ?? "",
    enderecoUf: c.enderecoUf ?? "",
    enderecoCep: (() => {
      const cepD = onlyDigits(c.enderecoCep ?? "");
      return cepD ? formatCep(cepD) : "";
    })(),
    observacoes: c.observacoes ?? "",
  };
}
