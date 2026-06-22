import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import CanPermission from "../auth/CanPermission";
import { PermissaoCodigo } from "../auth/permissao";
import { useAuth } from "../auth/AuthContext";
import "./AppLayout.css";

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

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

function IconLayoutDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
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

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function useNavDrawerMode() {
  const [navDrawer, setNavDrawer] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setNavDrawer(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return navDrawer;
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navDrawer = useNavDrawerMode();
  const [menuAberto, setMenuAberto] = useState(false);
  const [confirmarSaidaAberto, setConfirmarSaidaAberto] = useState(false);

  useEffect(() => {
    if (!navDrawer) {
      setMenuAberto(false);
    }
  }, [navDrawer]);

  useEffect(() => {
    if (!menuAberto || !navDrawer) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuAberto(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuAberto, navDrawer]);

  useEffect(() => {
    if (!menuAberto || !navDrawer) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [menuAberto, navDrawer]);

  function fecharMenu() {
    setMenuAberto(false);
  }

  function alternarMenu() {
    setMenuAberto((aberto) => !aberto);
  }

  function abrirConfirmarSaida() {
    fecharMenu();
    setConfirmarSaidaAberto(true);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const sidebarClass = ["app-shell-sidebar", menuAberto && navDrawer ? "app-shell-sidebar--open" : ""]
    .filter(Boolean)
    .join(" ");

  const navLinkClass = ({ isActive }: { isActive: boolean }) => `app-shell-nav-link${isActive ? " active" : ""}`;

  return (
    <div className="app-shell">
      <header className="app-shell-topbar">
        <img src="/logo-catec.png" alt="CATEC" className="app-shell-topbar-logo" width={120} height={68} />
        <button
          type="button"
          className="app-shell-menu-toggle"
          aria-expanded={menuAberto}
          aria-controls="app-shell-nav-drawer"
          onClick={alternarMenu}
        >
          {menuAberto ? <IconClose className="app-shell-menu-toggle-icon" /> : <IconMenu className="app-shell-menu-toggle-icon" />}
          <span className="app-shell-menu-toggle-label">{menuAberto ? "Fechar menu" : "Abrir menu"}</span>
        </button>
      </header>

      {menuAberto && navDrawer ? (
        <button type="button" className="app-shell-overlay" aria-label="Fechar menu" onClick={fecharMenu} />
      ) : null}

      <aside
        id="app-shell-nav-drawer"
        className={sidebarClass}
        {...(navDrawer && menuAberto
          ? { role: "dialog", "aria-modal": true, "aria-label": "Menu principal" }
          : navDrawer
            ? { "aria-hidden": true }
            : {})}
      >
        <div className="app-shell-sidebar-head">
          <div className="app-shell-brand">
            <img src="/logo-catec.png" alt="" className="app-shell-logo" width={160} height={90} />
          </div>
          {navDrawer ? (
            <button type="button" className="app-shell-sidebar-close" onClick={fecharMenu} aria-label="Fechar menu">
              <IconClose />
            </button>
          ) : null}
        </div>
        <nav className="app-shell-nav">
          <CanPermission code={PermissaoCodigo.TELA_PAINEL}>
            <NavLink to="/app/painel" className={navLinkClass} end onClick={fecharMenu}>
              <IconLayoutDashboard className="app-shell-nav-icon" />
              <span>Painel</span>
            </NavLink>
          </CanPermission>
          <CanPermission code={PermissaoCodigo.TELA_PROJETOS}>
            <NavLink to="/app/projetos" className={navLinkClass} onClick={fecharMenu}>
              <IconFolderKanban className="app-shell-nav-icon" />
              <span>Projetos</span>
            </NavLink>
          </CanPermission>
          <CanPermission code={PermissaoCodigo.TELA_SOCIO_PROPOSTAS}>
            <NavLink to="/app/socio/propostas" className={navLinkClass} onClick={fecharMenu}>
              <IconFolderKanban className="app-shell-nav-icon" />
              <span>Fila sócio</span>
            </NavLink>
          </CanPermission>
          <CanPermission code={PermissaoCodigo.TELA_CLIENTES}>
            <NavLink to="/app/clientes" className={navLinkClass} onClick={fecharMenu}>
              <IconClients className="app-shell-nav-icon" />
              <span>Clientes</span>
            </NavLink>
          </CanPermission>
          <CanPermission code={PermissaoCodigo.TELA_USUARIOS}>
            <NavLink to="/app/usuarios" className={navLinkClass} onClick={fecharMenu}>
              <IconUsers className="app-shell-nav-icon" />
              <span>Usuários</span>
            </NavLink>
          </CanPermission>
          <CanPermission code={PermissaoCodigo.TELA_GRUPOS}>
            <NavLink to="/app/grupos" className={navLinkClass} onClick={fecharMenu}>
              <IconShield className="app-shell-nav-icon" />
              <span>Grupos</span>
            </NavLink>
          </CanPermission>
        </nav>
        <div className="app-shell-footer">
          <div className="app-shell-user-card">
            <p className="app-shell-user-name">{user?.nome}</p>
            <p className="app-shell-user-email">{user?.email}</p>
          </div>
          <button type="button" className="app-shell-logout" onClick={abrirConfirmarSaida}>
            Sair
          </button>
        </div>
      </aside>
      <main className="app-shell-main">
        <Outlet />
      </main>
      {confirmarSaidaAberto ? (
        <div className="app-shell-confirm-backdrop" role="presentation" onClick={() => setConfirmarSaidaAberto(false)}>
          <div
            className="app-shell-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-saida-titulo"
            onClick={(e) => e.stopPropagation()}
          >
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
