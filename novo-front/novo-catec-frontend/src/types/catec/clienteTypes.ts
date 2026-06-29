export type TipoPessoa = 'PF' | 'PJ'

export type CatecClienteResponsavel = {
  id: number
  nome: string
  email: string
  telefone: string
}

export type CatecCliente = {
  id: number
  tipoPessoa: TipoPessoa
  razaoSocialOuNome: string
  nomeFantasia: string | null
  documento: string | null
  email: string | null
  telefone: string | null
  enderecoLogradouro: string | null
  enderecoNumero: string | null
  enderecoComplemento: string | null
  enderecoCidade: string | null
  enderecoUf: string | null
  enderecoCep: string | null
  periodoFaturamento: string
  observacoes: string | null
  responsaveis: CatecClienteResponsavel[]
}

export type CatecClienteResponsavelFormState = {
  nome: string
  email: string
  telefone: string
}

export type CatecClienteFormState = {
  tipoPessoa: TipoPessoa
  razaoSocialOuNome: string
  nomeFantasia: string
  documento: string
  email: string
  telefone: string
  enderecoLogradouro: string
  enderecoNumero: string
  enderecoComplemento: string
  enderecoCidade: string
  enderecoUf: string
  enderecoCep: string
  periodoFaturamento: string
  observacoes: string
  responsavel: CatecClienteResponsavelFormState
}

export const EMPTY_RESPONSAVEL_FORM: CatecClienteResponsavelFormState = {
  nome: '',
  email: '',
  telefone: ''
}

export const EMPTY_CLIENTE_FORM: CatecClienteFormState = {
  tipoPessoa: 'PF',
  razaoSocialOuNome: '',
  nomeFantasia: '',
  documento: '',
  email: '',
  telefone: '',
  enderecoLogradouro: '',
  enderecoNumero: '',
  enderecoComplemento: '',
  enderecoCidade: '',
  enderecoUf: '',
  enderecoCep: '',
  periodoFaturamento: '',
  observacoes: '',
  responsavel: { ...EMPTY_RESPONSAVEL_FORM }
}

export function rotuloTipoPessoa(tipo: TipoPessoa): string {
  return tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'
}
