export type Grupo = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  sistema: boolean;
  permissoes: string[];
  criadoEm: string;
  atualizadoEm: string;
};

export type PermissaoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  tipo: "TELA" | "ACAO";
  modulo: string;
  descricao: string | null;
};

export type GrupoFormState = {
  nome: string;
  descricao: string;
  ativo: boolean;
  permissoes: Set<string>;
};

export const MODULO_LABEL: Record<string, string> = {
  acesso: "Acesso",
  painel: "Painel",
  projeto: "Projeto",
  cliente: "Clientes",
  usuario: "Usuários",
  proposta: "Propostas",
  contrato: "Contrato",
  documento: "Documentos",
  interacao: "Interações",
};

export function rotuloModulo(modulo: string): string {
  return MODULO_LABEL[modulo] ?? modulo.charAt(0).toUpperCase() + modulo.slice(1);
}

export function emptyGrupoForm(): GrupoFormState {
  return {
    nome: "",
    descricao: "",
    ativo: true,
    permissoes: new Set(),
  };
}

export function grupoToForm(g: Grupo): GrupoFormState {
  return {
    nome: g.nome,
    descricao: g.descricao ?? "",
    ativo: g.ativo,
    permissoes: new Set(g.permissoes),
  };
}

export function agruparPermissoesPorModulo(catalogo: PermissaoCatalogo[]): Map<string, PermissaoCatalogo[]> {
  const map = new Map<string, PermissaoCatalogo[]>();
  for (const p of catalogo) {
    const list = map.get(p.modulo) ?? [];
    list.push(p);
    map.set(p.modulo, list);
  }
  for (const [modulo, list] of map) {
    list.sort((a, b) => {
      if (a.tipo !== b.tipo) return a.tipo === "TELA" ? -1 : 1;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
    map.set(modulo, list);
  }
  return map;
}

export function modulosOrdenados(map: Map<string, PermissaoCatalogo[]>): string[] {
  return [...map.keys()].sort((a, b) => rotuloModulo(a).localeCompare(rotuloModulo(b), "pt-BR"));
}
