import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { PermissaoCodigo } from "./auth/permissao";
import AppLayout from "./layout/AppLayout";
import RequireAuth from "./layout/RequireAuth";
import RequirePermission from "./layout/RequirePermission";
import "./layout/RequireAuth.css";
import DefinirSenhaPage from "./pages/DefinirSenhaPage";
import LoginPage from "./pages/LoginPage";
import ClienteFormPage from "./pages/ClienteFormPage";
import ClientesPage from "./pages/ClientesPage";
import GruposPage from "./pages/GruposPage";
import GrupoFormPage from "./pages/GrupoFormPage";
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
    return <Navigate to="/app/painel" replace />;
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
    return <Navigate to="/app/painel" replace />;
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
          <Route index element={<Navigate to="/app/painel" replace />} />
          <Route path="inicio" element={<Navigate to="/app/painel" replace />} />
          <Route
            path="painel"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_PAINEL}>
                <PainelPage />
              </RequirePermission>
            }
          />
          <Route
            path="projetos"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_PROJETOS} title="Projetos">
                <ProjetosPage />
              </RequirePermission>
            }
          />
          <Route
            path="projetos/:id"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_PROJETO_DETALHE}>
                <ProjetoDetalhePage />
              </RequirePermission>
            }
          />
          <Route
            path="socio/propostas"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_SOCIO_PROPOSTAS} title="Fila do sócio">
                <SocioPropostasPage />
              </RequirePermission>
            }
          />
          <Route
            path="clientes/novo"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_CLIENTES}>
                <ClienteFormPage />
              </RequirePermission>
            }
          />
          <Route
            path="clientes/:id/editar"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_CLIENTES}>
                <ClienteFormPage />
              </RequirePermission>
            }
          />
          <Route
            path="clientes"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_CLIENTES}>
                <ClientesPage />
              </RequirePermission>
            }
          />
          <Route
            path="usuarios"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_USUARIOS}>
                <UsuariosPage />
              </RequirePermission>
            }
          />
          <Route
            path="grupos/novo"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_GRUPOS}>
                <GrupoFormPage />
              </RequirePermission>
            }
          />
          <Route
            path="grupos/:id"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_GRUPOS}>
                <GrupoFormPage />
              </RequirePermission>
            }
          />
          <Route
            path="grupos"
            element={
              <RequirePermission code={PermissaoCodigo.TELA_GRUPOS}>
                <GruposPage />
              </RequirePermission>
            }
          />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/app/painel" replace />} />
      <Route path="*" element={<Navigate to="/app/painel" replace />} />
    </Routes>
  );
}
