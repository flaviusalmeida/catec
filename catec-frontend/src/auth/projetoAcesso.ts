import type { Projeto } from "../pages/projetoTypes";
import { PermissaoCodigo } from "./permissao";

/** Administrativo completo (gestão de cadastros e transições). */
export function isAdministrativo(hasPermission: (codigo: string) => boolean): boolean {
  return hasPermission(PermissaoCodigo.ACAO_CLIENTE_CRIAR);
}

/** Exibe o botão de editar projeto no detalhe / modal. */
export function podeExibirEditarProjeto(
  projeto: Projeto,
  userId: number | undefined,
  hasPermission: (codigo: string) => boolean,
): boolean {
  if (projeto.status === "PENDENTE_CLIENTE") {
    if (!hasPermission(PermissaoCodigo.ACAO_PROJETO_ASSOCIAR_CLIENTE)) return false;
    return isAdministrativo(hasPermission) || (userId != null && projeto.criadoPorId === userId);
  }
  if (!hasPermission(PermissaoCodigo.ACAO_PROJETO_EDITAR)) return false;
  if (isAdministrativo(hasPermission)) return true;
  return (
    userId != null &&
    projeto.criadoPorId === userId &&
    projeto.status === "AGUARDANDO_PROPOSTA_COMERCIAL"
  );
}

export function podeEditarCamposProjeto(
  projeto: Projeto | null,
  userId: number | undefined,
  hasPermission: (codigo: string) => boolean,
): boolean {
  if (!projeto || userId == null) return false;
  if (projeto.status === "PENDENTE_CLIENTE") return false;
  if (isAdministrativo(hasPermission)) return true;
  return (
    projeto.criadoPorId === userId && projeto.status === "AGUARDANDO_PROPOSTA_COMERCIAL"
  );
}
