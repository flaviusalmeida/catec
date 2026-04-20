export type ViaCepJson = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

export type EnderecoViaCep = {
  logradouro: string;
  cidade: string;
  uf: string;
};

/**
 * Consulta pública ViaCEP (sem autenticação).
 * @param cep8 exatamente 8 dígitos
 */
export async function buscarEnderecoPorCep(cep8: string, signal?: AbortSignal): Promise<EnderecoViaCep | null> {
  if (!/^\d{8}$/.test(cep8)) return null;
  const res = await fetch(`https://viacep.com.br/ws/${cep8}/json/`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as ViaCepJson;
  if (data.erro === true || data.erro === "true") return null;
  const log = (data.logradouro ?? "").trim();
  const bairro = (data.bairro ?? "").trim();
  const logradouro = log || bairro;
  const cidade = (data.localidade ?? "").trim();
  const uf = (data.uf ?? "").trim().toUpperCase().slice(0, 2);
  if (!cidade || !uf) return null;
  return { logradouro, cidade, uf };
}
