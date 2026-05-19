export async function mensagemErroApi(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  if (body && typeof body.mensagem === "string" && body.mensagem.trim()) {
    return body.mensagem;
  }
  return `${fallback} (${res.status})`;
}
