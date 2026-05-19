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
import { hasAllRoles, hasAnyRole, hasRole as perfilHasRole } from "./hasRole";
import type { PerfilCodigo } from "./perfil";
import { clearStoredAuth, getStoredToken, setStoredToken } from "./tokenStorage";

export type MeUser = {
  id: number;
  nome: string;
  email: string;
  perfis: string[];
  ativo: boolean;
  telefone: string | null;
  requerTrocaSenha?: boolean;
};

type AuthContextValue = {
  user: MeUser | null;
  loading: boolean;
  isAdmin: boolean;
  isSocio: boolean;
  /** Colaborador ou administrativo: demandas (projeto). */
  podeGerirProjetos: boolean;
  hasRole: (role: PerfilCodigo) => boolean;
  hasAnyRole: (roles: readonly PerfilCodigo[]) => boolean;
  hasAllRoles: (roles: readonly PerfilCodigo[]) => boolean;
  refreshMe: () => Promise<void>;
  loginWithToken: (accessToken: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
      setUser((await res.json()) as MeUser);
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

  const isAdmin = useMemo(() => user?.perfis?.includes("ADMINISTRATIVO") ?? false, [user]);
  const isSocio = useMemo(() => user?.perfis?.includes("SOCIO") ?? false, [user]);

  const podeGerirProjetos = useMemo(
    () => hasAnyRole(user?.perfis, ["COLABORADOR", "ADMINISTRATIVO"]),
    [user],
  );

  const hasRoleFn = useCallback((role: PerfilCodigo) => perfilHasRole(user?.perfis, role), [user]);
  const hasAnyRoleFn = useCallback(
    (roles: readonly PerfilCodigo[]) => hasAnyRole(user?.perfis, roles),
    [user],
  );
  const hasAllRolesFn = useCallback(
    (roles: readonly PerfilCodigo[]) => hasAllRoles(user?.perfis, roles),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      isSocio,
      podeGerirProjetos,
      hasRole: hasRoleFn,
      hasAnyRole: hasAnyRoleFn,
      hasAllRoles: hasAllRolesFn,
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
      hasRoleFn,
      hasAnyRoleFn,
      hasAllRolesFn,
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
