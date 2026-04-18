import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import AppLayout from "./layout/AppLayout";
import RequireAuth from "./layout/RequireAuth";
import "./layout/RequireAuth.css";
import DefinirSenhaPage from "./pages/DefinirSenhaPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UsuariosPage from "./pages/UsuariosPage";
import { getStoredToken } from "./api/http";

function LoginRoute() {
  const { user, loading } = useAuth();
  if (!loading && user) {
    if (user.requerTrocaSenha === true) {
      return <Navigate to="/definir-senha" replace />;
    }
    return <Navigate to="/app/inicio" replace />;
  }
  return <LoginPage />;
}

function DefinirSenhaRoute() {
  const { user, loading, logout } = useAuth();
  const token = getStoredToken();
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
    logout();
    return <Navigate to="/login" replace />;
  }
  if (user.requerTrocaSenha !== true) {
    return <Navigate to="/app/inicio" replace />;
  }
  return <DefinirSenhaPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/definir-senha" element={<DefinirSenhaRoute />} />
      <Route path="/app" element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/app/inicio" replace />} />
          <Route path="inicio" element={<HomePage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/app/inicio" replace />} />
      <Route path="*" element={<Navigate to="/app/inicio" replace />} />
    </Routes>
  );
}
