import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("catec_token") : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return (
      <div className="require-auth-loading">
        <p>Carregando…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.requerTrocaSenha === true) {
    return <Navigate to="/definir-senha" replace />;
  }
  return <Outlet />;
}
