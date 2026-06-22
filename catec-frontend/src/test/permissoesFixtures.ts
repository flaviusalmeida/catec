import { PermissaoCodigo } from "../auth/permissao";

/** Permissões do grupo COLABORADOR (seed V27). */
export const permissoesColaborador = [
  PermissaoCodigo.TELA_PAINEL,
  PermissaoCodigo.TELA_PROJETOS,
  PermissaoCodigo.TELA_PROJETO_DETALHE,
  PermissaoCodigo.ACAO_PROJETO_CRIAR,
  PermissaoCodigo.ACAO_PROJETO_EDITAR,
  PermissaoCodigo.ACAO_PROJETO_ASSOCIAR_CLIENTE,
] as const;

/** Todas as permissões (grupo ADMINISTRATIVO). */
export const permissoesAdministrativo = Object.values(PermissaoCodigo);
