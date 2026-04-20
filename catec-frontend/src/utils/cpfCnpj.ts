import { isEmailValid } from "./emailFormat";
import { isTelefoneBrasilValid } from "./telefoneBrasil";
import { onlyDigits } from "./digitsOnly";

export type TipoPessoa = "PF" | "PJ";

export { onlyDigits };

/** Máscara progressiva de CPF (até 11 dígitos). */
export function formatCpf(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

/** Máscara progressiva de CNPJ (até 14 dígitos). */
export function formatCnpj(digits: string): string {
  const d = digits.slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

export function formatDocumentoByTipo(tipo: TipoPessoa, digits: string): string {
  return tipo === "PF" ? formatCpf(digits) : formatCnpj(digits);
}

function allSameDigit(digits: string): boolean {
  if (digits.length === 0) return true;
  const first = digits[0];
  return digits.split("").every((c) => c === first);
}

function mod11CheckDigit(baseLength: number, digits: string, weights: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < baseLength; i++) {
    sum += parseInt(digits[i]!, 10) * weights[i]!;
  }
  const r = sum % 11;
  return r < 2 ? 0 : 11 - r;
}

const CPF_W1 = [10, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const CPF_W2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const CNPJ_W1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const CNPJ_W2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

/** CPF com 11 dígitos e dígitos verificadores corretos (rejeita sequências repetidas). */
export function isCpfValid(digits: string): boolean {
  if (digits.length !== 11 || !/^\d{11}$/.test(digits) || allSameDigit(digits)) {
    return false;
  }
  const v1 = mod11CheckDigit(9, digits, CPF_W1);
  const v2 = mod11CheckDigit(10, digits, CPF_W2);
  return v1 === parseInt(digits[9]!, 10) && v2 === parseInt(digits[10]!, 10);
}

/** CNPJ com 14 dígitos e dígitos verificadores corretos (rejeita sequências repetidas). */
export function isCnpjValid(digits: string): boolean {
  if (digits.length !== 14 || !/^\d{14}$/.test(digits) || allSameDigit(digits)) {
    return false;
  }
  const v1 = mod11CheckDigit(12, digits, CNPJ_W1);
  const v2 = mod11CheckDigit(13, digits, CNPJ_W2);
  return v1 === parseInt(digits[12]!, 10) && v2 === parseInt(digits[13]!, 10);
}

/** Valida campos obrigatórios e formato CPF/CNPJ; retorna mensagem de erro ou null. */
export function validateClienteObrigatorios(form: {
  tipoPessoa: TipoPessoa;
  razaoSocialOuNome: string;
  documento: string;
  email: string;
  telefone: string;
}): string | null {
  if (!form.razaoSocialOuNome.trim()) {
    return "Nome / Razão social é obrigatório.";
  }
  const doc = onlyDigits(form.documento);
  if (!doc) {
    return "CPF/CNPJ é obrigatório.";
  }
  if (form.tipoPessoa === "PF") {
    if (doc.length !== 11) {
      return "CPF deve ter 11 dígitos.";
    }
    if (!isCpfValid(doc)) {
      return "CPF inválido.";
    }
  } else {
    if (doc.length !== 14) {
      return "CNPJ deve ter 14 dígitos.";
    }
    if (!isCnpjValid(doc)) {
      return "CNPJ inválido.";
    }
  }
  const email = form.email.trim();
  if (!email) {
    return "E-mail é obrigatório.";
  }
  if (!isEmailValid(email)) {
    return "Informe um e-mail válido.";
  }
  const tel = onlyDigits(form.telefone);
  if (!tel) {
    return "Telefone é obrigatório.";
  }
  if (!isTelefoneBrasilValid(tel)) {
    return "Telefone inválido. Use DDD + número (10 ou 11 dígitos).";
  }
  return null;
}
