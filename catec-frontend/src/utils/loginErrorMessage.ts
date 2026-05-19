type ApiErrorBody = {
  status?: number;
  mensagem?: string;
};

export function mensagemErroLogin(status: number, body: unknown): string {
  if (body && typeof body === "object" && "mensagem" in body) {
    const msg = String((body as ApiErrorBody).mensagem).trim();
    if (msg) {
      return msg;
    }
  }
  if (status === 401) {
    return "E-mail ou senha incorretos. Verifique os dados e tente novamente.";
  }
  if (status === 403) {
    return "Conta inativa ou sem permissão para entrar. Contacte o administrativo.";
  }
  if (status >= 500) {
    return "Servidor indisponível no momento. Tente novamente em instantes.";
  }
  return `Não foi possível entrar (${status}).`;
}
