import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, getStoredToken } from "../api/http";

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
        localStorage.removeItem("catec_token");
        localStorage.removeItem("catec_token_type");
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
      localStorage.setItem("catec_token", accessToken);
      localStorage.setItem("catec_token_type", "Bearer");
      await refreshMe();
    },
    [refreshMe],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("catec_token");
    localStorage.removeItem("catec_token_type");
    setUser(null);
  }, []);

  const isAdmin = useMemo(() => user?.perfis?.includes("ADMINISTRATIVO") ?? false, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      refreshMe,
      loginWithToken,
      logout,
    }),
    [user, loading, isAdmin, refreshMe, loginWithToken, logout],
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
