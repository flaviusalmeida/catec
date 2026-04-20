import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./AppLayout.css";

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconClients({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconFolderKanban({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      <path d="M8 10v6M12 10v6M16 10v6" />
    </svg>
  );
}

export default function AppLayout() {
  const { user, logout, isAdmin, podeGerirProjetos } = useAuth();
  const navigate = useNavigate();
  const [confirmarSaidaAberto, setConfirmarSaidaAberto] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="app-shell-sidebar">
        <div className="app-shell-brand">
          <img src="/logo-catec.png" alt="" className="app-shell-logo" width={160} height={90} />
        </div>
        <nav className="app-shell-nav">
          <NavLink to="/app/inicio" className={({ isActive }) => `app-shell-nav-link${isActive ? " active" : ""}`} end>
            <IconHome className="app-shell-nav-icon" />
            <span>Início</span>
          </NavLink>
          {podeGerirProjetos ? (
            <NavLink to="/app/projetos" className={({ isActive }) => `app-shell-nav-link${isActive ? " active" : ""}`}>
              <IconFolderKanban className="app-shell-nav-icon" />
              <span>Projetos</span>
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to="/app/clientes" className={({ isActive }) => `app-shell-nav-link${isActive ? " active" : ""}`}>
              <IconClients className="app-shell-nav-icon" />
              <span>Clientes</span>
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to="/app/usuarios" className={({ isActive }) => `app-shell-nav-link${isActive ? " active" : ""}`}>
              <IconUsers className="app-shell-nav-icon" />
              <span>Usuários</span>
            </NavLink>
          ) : null}
        </nav>
        <div className="app-shell-footer">
          <div className="app-shell-user-card">
            <p className="app-shell-user-name">{user?.nome}</p>
            <p className="app-shell-user-email">{user?.email}</p>
          </div>
          <button type="button" className="app-shell-logout" onClick={() => setConfirmarSaidaAberto(true)}>
            Sair
          </button>
        </div>
      </aside>
      <main className="app-shell-main">
        <Outlet />
      </main>
      {confirmarSaidaAberto ? (
        <div className="app-shell-confirm-backdrop" role="presentation" onClick={() => setConfirmarSaidaAberto(false)}>
          <div className="app-shell-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirmar-saida-titulo" onClick={(e) => e.stopPropagation()}>
            <h2 id="confirmar-saida-titulo" className="app-shell-confirm-title">
              Confirmar saida
            </h2>
            <p className="app-shell-confirm-copy">Deseja realmente sair da sessao?</p>
            <div className="app-shell-confirm-actions">
              <button type="button" className="app-shell-confirm-cancel" onClick={() => setConfirmarSaidaAberto(false)}>
                Cancelar
              </button>
              <button type="button" className="app-shell-confirm-submit" onClick={handleLogout}>
                Sair
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
