import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import AppLayout from "./layout/AppLayout";
import RequireAuth from "./layout/RequireAuth";
import RequireRole from "./layout/RequireRole";
import "./layout/RequireAuth.css";
import DefinirSenhaPage from "./pages/DefinirSenhaPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ClienteFormPage from "./pages/ClienteFormPage";
import ClientesPage from "./pages/ClientesPage";
import ProjetosPage from "./pages/ProjetosPage";
import ProjetoDetalhePage from "./pages/ProjetoDetalhePage";
import SocioPropostasPage from "./pages/SocioPropostasPage";
import UsuariosPage from "./pages/UsuariosPage";
import PainelPage from "./pages/PainelPage";
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
          <Route
            path="painel"
            element={
              <RequireRole anyOf={["COLABORADOR", "ADMINISTRATIVO", "SOCIO"]}>
                <PainelPage />
              </RequireRole>
            }
          />
          <Route
            path="projetos"
            element={
              <RequireRole anyOf={["COLABORADOR", "ADMINISTRATIVO"]} title="Projetos">
                <ProjetosPage />
              </RequireRole>
            }
          />
          <Route
            path="projetos/:id"
            element={
              <RequireRole anyOf={["COLABORADOR", "ADMINISTRATIVO", "SOCIO"]}>
                <ProjetoDetalhePage />
              </RequireRole>
            }
          />
          <Route
            path="socio/propostas"
            element={
              <RequireRole anyOf={["SOCIO"]} title="Fila do sócio">
                <SocioPropostasPage />
              </RequireRole>
            }
          />
          <Route
            path="clientes/novo"
            element={
              <RequireRole anyOf={["ADMINISTRATIVO"]}>
                <ClienteFormPage />
              </RequireRole>
            }
          />
          <Route
            path="clientes/:id/editar"
            element={
              <RequireRole anyOf={["ADMINISTRATIVO"]}>
                <ClienteFormPage />
              </RequireRole>
            }
          />
          <Route
            path="clientes"
            element={
              <RequireRole anyOf={["ADMINISTRATIVO"]}>
                <ClientesPage />
              </RequireRole>
            }
          />
          <Route
            path="usuarios"
            element={
              <RequireRole anyOf={["ADMINISTRATIVO"]}>
                <UsuariosPage />
              </RequireRole>
            }
          />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/app/inicio" replace />} />
      <Route path="*" element={<Navigate to="/app/inicio" replace />} />
    </Routes>
  );
}
