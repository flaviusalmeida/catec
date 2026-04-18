import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import "./UsuariosPage.css";

const PERFIS_OPCOES = [
  {
    valor: "COLABORADOR",
    rotulo: "Colaborador",
    detalhe: "Operações do dia a dia, sem gestão de usuários.",
  },
  {
    valor: "ADMINISTRATIVO",
    rotulo: "Administrativo",
    detalhe: "Gestão de usuários e cadastros administrativos sensíveis.",
  },
  {
    valor: "SOCIO",
    rotulo: "Sócio",
    detalhe: "Visão estratégica, aprovações e direcionamento de alto nível.",
  },
  {
    valor: "SALA_TECNICA",
    rotulo: "Sala técnica",
    detalhe: "Análises técnicas e apoio especializado interno.",
  },
  {
    valor: "CAMPO",
    rotulo: "Campo",
    detalhe: "Inspeções, medições e registros em obra.",
  },
  {
    valor: "FINANCEIRO",
    rotulo: "Financeiro",
    detalhe: "Faturamento, pagamentos e relatórios financeiros.",
  },
] as const;

type AdminUsuario = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  ativo: boolean;
  requerTrocaSenha: boolean;
  perfis: string[];
  criadoEm: string;
  atualizadoEm: string;
};

type FormState = {
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  perfis: Set<string>;
};

function emptyForm(): FormState {
  return {
    nome: "",
    email: "",
    telefone: "",
    ativo: true,
    perfis: new Set(["COLABORADOR"]),
  };
}

function formFromUsuario(u: AdminUsuario): FormState {
  return {
    nome: u.nome,
    email: u.email,
    telefone: u.telefone ?? "",
    ativo: u.ativo,
    perfis: new Set(u.perfis),
  };
}

function filtrarUsuarios(
  lista: AdminUsuario[],
  nome: string,
  email: string,
  perfil: string,
  status: "" | "ativo" | "inativo",
): AdminUsuario[] {
  const n = nome.trim().toLowerCase();
  const e = email.trim().toLowerCase();
  return lista.filter((u) => {
    if (n && !u.nome.toLowerCase().includes(n)) return false;
    if (e && !u.email.toLowerCase().includes(e)) return false;
    if (perfil && !u.perfis.includes(perfil)) return false;
    if (status === "ativo" && !u.ativo) return false;
    if (status === "inativo" && u.ativo) return false;
    return true;
  });
}

function IconPerfilAjuda() {
  return (
    <svg className="usuarios-perfil-help-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg className="usuarios-btn-edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UsuariosPage() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [lista, setLista] = useState<AdminUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"" | "ativo" | "inativo">("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modo, setModo] = useState<"criar" | "editar">("criar");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [contaPendenteTrocaSenha, setContaPendenteTrocaSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [resetandoSenha, setResetandoSenha] = useState(false);

  const deferredNome = useDeferredValue(filtroNome);
  const deferredEmail = useDeferredValue(filtroEmail);
  const filtrosDigitacaoPendentes = filtroNome !== deferredNome || filtroEmail !== deferredEmail;

  const listaFiltrada = useMemo(
    () => filtrarUsuarios(lista, deferredNome, deferredEmail, filtroPerfil, filtroStatus),
    [lista, deferredNome, deferredEmail, filtroPerfil, filtroStatus],
  );

  useEffect(() => {
    if (!sucesso) return;
    const t = window.setTimeout(() => setSucesso(null), 6000);
    return () => window.clearTimeout(t);
  }, [sucesso]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiFetch("/api/v1/admin/usuarios");
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        setErro("Você não tem permissão para gerenciar usuários.");
        setLista([]);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body && typeof body === "object" && "mensagem" in body ? String(body.mensagem) : `Erro ${res.status}`;
        setErro(msg);
        return;
      }
      setLista((await res.json()) as AdminUsuario[]);
    } catch {
      setErro("Não foi possível carregar a lista.");
    } finally {
      setCarregando(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (isAdmin) void carregar();
  }, [isAdmin, carregar]);

  function limparFiltros() {
    setFiltroNome("");
    setFiltroEmail("");
    setFiltroPerfil("");
    setFiltroStatus("");
  }

  function abrirCriar() {
    setErro(null);
    setSucesso(null);
    setModo("criar");
    setEditandoId(null);
    setContaPendenteTrocaSenha(false);
    setForm(emptyForm());
    setModalAberto(true);
  }

  function abrirEditar(u: AdminUsuario) {
    setErro(null);
    setSucesso(null);
    setModo("editar");
    setEditandoId(u.id);
    setContaPendenteTrocaSenha(u.requerTrocaSenha);
    setForm(formFromUsuario(u));
    setModalAberto(true);
  }

  function togglePerfil(valor: string) {
    setForm((f) => {
      const next = new Set(f.perfis);
      if (next.has(valor)) {
        next.delete(valor);
      } else {
        next.add(valor);
      }
      return { ...f, perfis: next };
    });
  }

  async function solicitarResetSenha() {
    if (editandoId == null || modo !== "editar") return;
    if (
      !window.confirm(
        "Será gerada uma nova senha provisória, a conta ficará inativa até o próximo acesso e o usuário receberá um e-mail. Continuar?",
      )
    ) {
      return;
    }
    setResetandoSenha(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/admin/usuarios/${editandoId}/resetar-senha`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ao redefinir (${res.status})`);
        return;
      }
      setSucesso("Nova senha provisória enviada por e-mail.");
      setContaPendenteTrocaSenha(true);
      setForm((f) => ({ ...f, ativo: false }));
      await carregar();
    } catch {
      setErro("Falha de rede ao redefinir a senha.");
    } finally {
      setResetandoSenha(false);
    }
  }

  async function salvar() {
    if (form.perfis.size === 0) {
      setErro("Selecione pelo menos um perfil.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const perfis = [...form.perfis];
      if (modo === "criar") {
        const res = await apiFetch("/api/v1/admin/usuarios", {
          method: "POST",
          body: JSON.stringify({
            nome: form.nome.trim(),
            email: form.email.trim(),
            telefone: form.telefone.trim() || null,
            perfis,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setErro(body?.mensagem ?? `Erro ao criar (${res.status})`);
          return;
        }
        setSucesso("Conta criada como inativa. Foi enviada uma senha provisória por e-mail.");
      } else if (editandoId != null) {
        const payload = {
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.trim() || null,
          ativo: form.ativo,
          perfis,
        };
        const res = await apiFetch(`/api/v1/admin/usuarios/${editandoId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setErro(body?.mensagem ?? `Erro ao atualizar (${res.status})`);
          return;
        }
        setSucesso("Usuário atualizado com sucesso.");
      }
      setModalAberto(false);
      await carregar();
    } catch {
      setErro("Falha de rede ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="usuarios-page">
        <div className="usuarios-page-inner">
          <div className="usuarios-card usuarios-card--denied">
            <h1 className="usuarios-title">Usuários</h1>
            <p>Seu perfil não inclui permissão de administrador técnico para esta tela.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-page">
      <div className="usuarios-page-inner usuarios-page-stack">
        <header className="usuarios-toolbar">
          <div className="usuarios-toolbar-text">
            <h1 className="usuarios-title">Usuários</h1>
            <p className="usuarios-subtitle">Gestão de contas internas e perfis de acesso.</p>
          </div>
          <button type="button" className="usuarios-btn-primary usuarios-btn-cta" onClick={abrirCriar}>
            Novo usuário
          </button>
        </header>

        {sucesso ? (
          <div className="usuarios-alert usuarios-alert--success" role="status">
            <span>{sucesso}</span>
            <button type="button" className="usuarios-alert-dismiss" onClick={() => setSucesso(null)}>
              Fechar
            </button>
          </div>
        ) : null}

        {erro && !modalAberto ? <div className="usuarios-alert usuarios-alert--error">{erro}</div> : null}

        <section className="usuarios-card usuarios-card--filters" aria-labelledby="usuarios-filtros-heading">
          <div className="usuarios-filters-head">
            <h2 id="usuarios-filtros-heading" className="usuarios-filters-title">
              Filtros
            </h2>
            <button type="button" className="usuarios-link-clear" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
          <div className="usuarios-filters-grid">
            <div>
              <label className="usuarios-filter-label" htmlFor="flt-nome">
                Nome
              </label>
              <input
                id="flt-nome"
                className="usuarios-input usuarios-input--compact"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                placeholder="Buscar por nome"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="usuarios-filter-label" htmlFor="flt-email">
                E-mail
              </label>
              <input
                id="flt-email"
                type="text"
                className="usuarios-input usuarios-input--compact"
                value={filtroEmail}
                onChange={(e) => setFiltroEmail(e.target.value)}
                placeholder="Buscar por e-mail"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="usuarios-filter-label" htmlFor="flt-perfil">
                Perfil
              </label>
              <select
                id="flt-perfil"
                className="usuarios-select usuarios-select--compact"
                value={filtroPerfil}
                onChange={(e) => setFiltroPerfil(e.target.value)}
              >
                <option value="">Todos</option>
                {PERFIS_OPCOES.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.rotulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="usuarios-filter-label" htmlFor="flt-status">
                Status
              </label>
              <select
                id="flt-status"
                className="usuarios-select usuarios-select--compact"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as "" | "ativo" | "inativo")}
              >
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        </section>

        <section className="usuarios-card usuarios-card--table" aria-busy={carregando}>
          {carregando ? (
            <div className="usuarios-loading">
              <div className="usuarios-spinner" aria-hidden />
              <p className="usuarios-loading-text">Carregando lista…</p>
            </div>
          ) : lista.length === 0 ? (
            <div className="usuarios-empty usuarios-empty--standalone" role="status">
              <p className="usuarios-empty-title">Nenhum usuário</p>
              <p className="usuarios-empty-text">Ainda não há contas cadastradas no sistema.</p>
            </div>
          ) : (
            <div
              className={`usuarios-table-wrap${filtrosDigitacaoPendentes ? " usuarios-table-wrap--filter-pending" : ""}`}
            >
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Perfis</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="usuarios-th-actions">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listaFiltrada.length === 0 ? (
                    <tr className="usuarios-table-empty-row">
                      <td colSpan={5}>
                        <p className="usuarios-filter-empty" role="status">
                          Não há usuários que correspondam aos filtros.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    listaFiltrada.map((u, idx) => (
                      <tr
                        key={u.id}
                        className={`usuarios-table-data-row${idx % 2 === 1 ? " usuarios-table-data-row--alt" : ""}`}
                        onClick={() => abrirEditar(u)}
                      >
                        <td className="usuarios-td-nome">{u.nome}</td>
                        <td className="usuarios-td-email">{u.email}</td>
                        <td className="usuarios-perfis">{u.perfis.join(", ")}</td>
                        <td>
                          <div className="usuarios-status-badges">
                            {u.requerTrocaSenha ? (
                              <span className="usuarios-badge usuarios-badge--pendente">Troca senha</span>
                            ) : u.ativo ? (
                              <span className="usuarios-badge usuarios-badge--ativo">Ativo</span>
                            ) : (
                              <span className="usuarios-badge usuarios-badge--inativo">Inativo</span>
                            )}
                          </div>
                        </td>
                        <td className="usuarios-td-actions">
                          <button
                            type="button"
                            className="usuarios-btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirEditar(u);
                            }}
                            aria-label={`Editar ${u.nome}`}
                          >
                            <IconEdit />
                            <span>Editar</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {modalAberto ? (
        <div
          className="usuarios-modal-backdrop"
          role="presentation"
          onClick={() => !salvando && !resetandoSenha && setModalAberto(false)}
        >
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuarios-modal-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="usuarios-modal-titulo" className="usuarios-modal-title">
              {modo === "criar" ? "Novo usuário" : "Editar usuário"}
            </h2>
            {erro ? <div className="usuarios-alert usuarios-alert--error">{erro}</div> : null}

            <div className="usuarios-modal-section">
              <h3 className="usuarios-modal-section-title">Dados básicos</h3>
              <label className="usuarios-label" htmlFor="uf-nome">
                Nome
              </label>
              <input
                id="uf-nome"
                className="usuarios-input usuarios-input--modal"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                disabled={salvando}
              />
              <label className="usuarios-label" htmlFor="uf-email">
                E-mail
              </label>
              <input
                id="uf-email"
                type="email"
                className="usuarios-input usuarios-input--modal"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                disabled={salvando}
              />
              <label className="usuarios-label" htmlFor="uf-tel">
                Telefone
              </label>
              <input
                id="uf-tel"
                className="usuarios-input usuarios-input--modal"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                disabled={salvando}
              />
            </div>

            <div className="usuarios-modal-section">
              <h3 className="usuarios-modal-section-title">Acesso</h3>
              {modo === "criar" ? (
                <p className="usuarios-criar-acesso-info">
                  A conta é criada <strong>inativa</strong>. O sistema gera uma senha provisória e envia por e-mail.
                  No primeiro acesso o usuário define uma senha forte e a conta fica ativa.
                </p>
              ) : (
                <>
                  {!contaPendenteTrocaSenha ? (
                    <label className="usuarios-toggle" htmlFor="uf-ativo">
                      <input
                        id="uf-ativo"
                        type="checkbox"
                        className="usuarios-toggle-input"
                        checked={form.ativo}
                        onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                        disabled={salvando}
                      />
                      <span className="usuarios-toggle-ui" aria-hidden />
                      <span className="usuarios-toggle-copy">
                        <span className="usuarios-toggle-title">Conta ativa</span>
                      </span>
                    </label>
                  ) : null}
                  <button
                    type="button"
                    className="usuarios-btn-reset-senha"
                    onClick={() => void solicitarResetSenha()}
                    disabled={salvando || resetandoSenha}
                  >
                    {resetandoSenha ? "A enviar…" : "Redefinir senha"}
                  </button>
                </>
              )}
            </div>

            <div className="usuarios-modal-section">
              <h3 className="usuarios-modal-section-title">Permissões</h3>
              <div className="usuarios-perfis-modal-grid">
                {PERFIS_OPCOES.map((p) => {
                  const popId = `catec-perfil-pop-${p.valor}`;
                  return (
                    <div key={p.valor} className="usuarios-perfil-option">
                      <label className="usuarios-perfil-option-main" htmlFor={`uf-perfil-${p.valor}`}>
                        <input
                          id={`uf-perfil-${p.valor}`}
                          type="checkbox"
                          className="usuarios-perfil-option-input"
                          checked={form.perfis.has(p.valor)}
                          onChange={() => togglePerfil(p.valor)}
                          disabled={salvando}
                        />
                        <span className="usuarios-perfil-option-title">{p.rotulo}</span>
                      </label>
                      <button
                        type="button"
                        className="usuarios-perfil-help"
                        popoverTarget={popId}
                        aria-label={`O que é o perfil ${p.rotulo}?`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconPerfilAjuda />
                      </button>
                      <div id={popId} className="usuarios-perfil-popover" popover="auto">
                        <p className="usuarios-perfil-popover-text">{p.detalhe}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="usuarios-modal-actions">
              <button
                type="button"
                className="usuarios-btn-ghost"
                onClick={() => setModalAberto(false)}
                disabled={salvando || resetandoSenha}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="usuarios-btn-primary"
                onClick={() => void salvar()}
                disabled={salvando || resetandoSenha}
              >
                {salvando ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
