/** Códigos de perfil devolvidos por `GET /api/v1/me` (espelham o backend). */
export type PerfilCodigo = "ADMINISTRATIVO" | "COLABORADOR" | "SOCIO";

export const PERFIS_INTERNOS: PerfilCodigo[] = ["ADMINISTRATIVO", "COLABORADOR", "SOCIO"];
