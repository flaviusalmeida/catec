import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../api/http";
import { hasAllPermissions, hasAnyPermission, hasPermission as checkPermission } from "./hasPermission";
import { PermissaoCodigo } from "./permissao";
import { clearStoredAuth, getStoredToken, setStoredToken } from "./tokenStorage";

export type MeUser = {
  id: number;
  nome: string;
  email: string;
  grupos: string[];
  permissoes: string[];
  ativo: boolean;
  telefone: string | null;
  requerTrocaSenha?: boolean;
};

type AuthContextValue = {
  user: MeUser | null;
  loading: boolean;
  /** Fluxo administrativo completo (gestão de cadastros e transições). */
  isAdmin: boolean;
  isSocio: boolean;
  /** Colaborador ou administrativo: demandas (projeto). */
  podeGerirProjetos: boolean;
  hasPermission: (codigo: string) => boolean;
  hasAnyPermission: (codigos: readonly string[]) => boolean;
  hasAllPermissions: (codigos: readonly string[]) => boolean;
  refreshMe: () => Promise<void>;
  loginWithToken: (accessToken: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseMeUser(raw: unknown): MeUser {
  const data = raw as Record<string, unknown>;
  const grupos = (data.grupos ?? []) as string[];
  const permissoes = (data.permissoes ?? []) as string[];
  return {
    id: Number(data.id),
    nome: String(data.nome ?? ""),
    email: String(data.email ?? ""),
    grupos,
    permissoes,
    ativo: Boolean(data.ativo),
    telefone: data.telefone != null ? String(data.telefone) : null,
    requerTrocaSenha: data.requerTrocaSenha === true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(() => !!getStoredToken());

  const refreshMe = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/me");
      if (!res.ok) {
        clearStoredAuth();
        setUser(null);
        return;
      }
      setUser(parseMeUser(await res.json()));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const loginWithToken = useCallback(
    async (accessToken: string) => {
      setStoredToken(accessToken);
      await refreshMe();
    },
    [refreshMe],
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  const permissoes = user?.permissoes;

  const isAdmin = useMemo(
    () => checkPermission(permissoes, PermissaoCodigo.ACAO_CLIENTE_CRIAR),
    [permissoes],
  );
  const isSocio = useMemo(
    () => checkPermission(permissoes, PermissaoCodigo.ACAO_SOCIO_PROPOSTA_APROVAR),
    [permissoes],
  );

  const podeGerirProjetos = useMemo(
    () => checkPermission(permissoes, PermissaoCodigo.ACAO_PROJETO_CRIAR),
    [permissoes],
  );

  const hasPermissionFn = useCallback((codigo: string) => checkPermission(permissoes, codigo), [permissoes]);
  const hasAnyPermissionFn = useCallback(
    (codigos: readonly string[]) => hasAnyPermission(permissoes, codigos),
    [permissoes],
  );
  const hasAllPermissionsFn = useCallback(
    (codigos: readonly string[]) => hasAllPermissions(permissoes, codigos),
    [permissoes],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      isSocio,
      podeGerirProjetos,
      hasPermission: hasPermissionFn,
      hasAnyPermission: hasAnyPermissionFn,
      hasAllPermissions: hasAllPermissionsFn,
      refreshMe,
      loginWithToken,
      logout,
    }),
    [
      user,
      loading,
      isAdmin,
      isSocio,
      podeGerirProjetos,
      hasPermissionFn,
      hasAnyPermissionFn,
      hasAllPermissionsFn,
      refreshMe,
      loginWithToken,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
