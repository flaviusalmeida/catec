import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import GhostButton from "../components/buttons/GhostButton";
import PrimaryButton from "../components/buttons/PrimaryButton";
import FieldControl from "../components/form/FieldControl";
import FormField from "../components/form/FormField";
import ConfirmDialog from "../components/layout/ConfirmDialog";
import DataTableSection from "../components/layout/DataTableSection";
import FiltersCard from "../components/layout/FiltersCard";
import FormDialog from "../components/layout/FormDialog";
import ModalFooter from "../components/layout/ModalFooter";
import ModalFormGrid from "../components/layout/ModalFormGrid";
import ModalSection from "../components/layout/ModalSection";
import PageToolbar from "../components/layout/PageToolbar";
import RowEditButton from "../components/table/RowEditButton";
import AccessDeniedCard from "../components/ui/AccessDeniedCard";
import InlineAlert from "../components/ui/InlineAlert";
import LabeledSwitch from "../components/ui/LabeledSwitch";
import StatusBadge, { StatusBadgeGroup } from "../components/ui/StatusBadge";
import ToastAlert from "../components/ui/ToastAlert";
import "../styles/admin-crud-table.css";
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
  const [confirmarResetAberto, setConfirmarResetAberto] = useState(false);

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
    setConfirmarResetAberto(false);
    setForm(emptyForm());
    setModalAberto(true);
  }

  function abrirEditar(u: AdminUsuario) {
    setErro(null);
    setSucesso(null);
    setModo("editar");
    setEditandoId(u.id);
    setContaPendenteTrocaSenha(u.requerTrocaSenha);
    setConfirmarResetAberto(false);
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
      setConfirmarResetAberto(false);
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
          <AccessDeniedCard
            titleId="usuarios-acesso-negado"
            title="Usuários"
            message="Seu perfil não inclui permissão de administrador técnico para esta tela."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-page">
      <ToastAlert
        open={Boolean(sucesso)}
        variant="success"
        onDismiss={() => setSucesso(null)}
        dismissAriaLabel="Fechar notificação"
        dismissTitle="Fechar"
      >
        {sucesso}
      </ToastAlert>
      <div className="usuarios-page-inner usuarios-page-stack">
        <PageToolbar
          title="Usuários"
          subtitle="Gestão de contas internas e perfis de acesso."
          actions={
            <PrimaryButton variant="toolbar" onClick={abrirCriar}>
              Novo usuário
            </PrimaryButton>
          }
        />

        {erro && !modalAberto ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

        <FiltersCard headingId="usuarios-filtros-heading" onClear={limparFiltros}>
          <div>
            <label className="filters-card__label" htmlFor="flt-nome">
              Nome
            </label>
            <FieldControl
              id="flt-nome"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              variant="compact"
              placeholder="Buscar por nome"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="filters-card__label" htmlFor="flt-email">
              E-mail
            </label>
            <FieldControl
              id="flt-email"
              type="text"
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
              variant="compact"
              placeholder="Buscar por e-mail"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="filters-card__label" htmlFor="flt-perfil">
              Perfil
            </label>
            <FieldControl
              as="select"
              id="flt-perfil"
              value={filtroPerfil}
              onChange={(e) => setFiltroPerfil(e.target.value)}
              variant="compact"
            >
              <option value="">Todos</option>
              {PERFIS_OPCOES.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.rotulo}
                </option>
              ))}
            </FieldControl>
          </div>
          <div>
            <label className="filters-card__label" htmlFor="flt-status">
              Status
            </label>
            <FieldControl
              as="select"
              id="flt-status"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as "" | "ativo" | "inativo")}
              variant="compact"
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </FieldControl>
          </div>
        </FiltersCard>

        <DataTableSection
          loading={carregando}
          loadingLabel="Carregando lista…"
          empty={lista.length === 0}
          emptyTitle="Nenhum usuário"
          emptyDescription="Ainda não há contas cadastradas no sistema."
          filterPending={filtrosDigitacaoPendentes}
        >
          <table className="admin-crud-table usuarios-data-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Perfis</th>
                <th scope="col">Status</th>
                <th scope="col" className="admin-crud-table__th-actions">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr className="admin-crud-table__empty-row">
                  <td colSpan={5}>
                    <p className="admin-crud-table__filter-msg" role="status">
                      Não há usuários que correspondam aos filtros.
                    </p>
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={`admin-crud-table__row${idx % 2 === 1 ? " admin-crud-table__row--alt" : ""}`}
                    onClick={() => abrirEditar(u)}
                  >
                    <td className="admin-crud-table__cell-primary">{u.nome}</td>
                    <td className="admin-crud-table__cell-muted">{u.email}</td>
                    <td className="usuarios-perfis">{u.perfis.join(", ")}</td>
                    <td>
                      <StatusBadgeGroup>
                        {u.requerTrocaSenha ? (
                          <StatusBadge variant="pendente">Troca senha</StatusBadge>
                        ) : u.ativo ? (
                          <StatusBadge variant="ativo">Ativo</StatusBadge>
                        ) : (
                          <StatusBadge variant="inativo">Inativo</StatusBadge>
                        )}
                      </StatusBadgeGroup>
                    </td>
                    <td className="admin-crud-table__td-actions">
                      <RowEditButton ariaLabel={`Editar ${u.nome}`} onClick={() => abrirEditar(u)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataTableSection>
      </div>

      <FormDialog
        open={modalAberto}
        titleId="usuarios-modal-titulo"
        title={modo === "criar" ? "Novo usuário" : "Editar usuário"}
        onBackdropClick={() => {
          if (salvando || resetandoSenha) return;
          setModalAberto(false);
          setConfirmarResetAberto(false);
        }}
      >
        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

        <ModalSection title="Dados básicos" titleId="usuario-modal-sec-basico">
          <ModalFormGrid balanced>
            <FormField label="Nome" htmlFor="uf-nome">
              <FieldControl
                id="uf-nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                variant="modal"
                disabled={salvando}
              />
            </FormField>
            <FormField label="E-mail" htmlFor="uf-email">
              <FieldControl
                id="uf-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                variant="modal"
                disabled={salvando}
              />
            </FormField>
          </ModalFormGrid>
          <FormField label="Telefone" htmlFor="uf-tel">
            <FieldControl
              id="uf-tel"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              variant="modal"
              disabled={salvando}
            />
          </FormField>
        </ModalSection>

        <ModalSection title="Acesso" titleId="usuario-modal-sec-acesso">
          {modo === "criar" ? (
            <p className="usuarios-criar-acesso-info">
              A conta é criada <strong>inativa</strong>. O sistema gera uma senha provisória e envia por e-mail. No primeiro acesso o
              usuário define uma senha forte e a conta fica ativa.
            </p>
          ) : (
            <>
              {!contaPendenteTrocaSenha ? (
                <LabeledSwitch
                  id="uf-ativo"
                  label="Conta ativa"
                  checked={form.ativo}
                  onChange={(checked) => {
                    setForm((f) => ({ ...f, ativo: checked }));
                    setConfirmarResetAberto(false);
                  }}
                  disabled={salvando}
                />
              ) : null}
              {form.ativo ? (
                <button
                  type="button"
                  className="usuarios-btn-reset-senha"
                  onClick={() => setConfirmarResetAberto(true)}
                  disabled={salvando || resetandoSenha}
                >
                  {resetandoSenha ? "A enviar…" : "Redefinir senha"}
                </button>
              ) : null}
            </>
          )}
        </ModalSection>

        <ModalSection title="Permissões" titleId="usuario-modal-sec-permis">
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
        </ModalSection>

        <ModalFooter>
          <GhostButton
            onClick={() => {
              setModalAberto(false);
              setConfirmarResetAberto(false);
            }}
            disabled={salvando || resetandoSenha}
          >
            Cancelar
          </GhostButton>
          <PrimaryButton onClick={() => void salvar()} disabled={salvando || resetandoSenha}>
            {salvando ? "Salvando…" : "Salvar"}
          </PrimaryButton>
        </ModalFooter>
      </FormDialog>

      <ConfirmDialog
        open={confirmarResetAberto}
        titleId="usuarios-confirm-reset-titulo"
        title="Confirmar redefinição"
        description="Será gerada uma nova senha provisória, a conta ficará inativa até o próximo acesso e o usuário receberá um e-mail. Continuar?"
        onBackdropClick={() => !resetandoSenha && setConfirmarResetAberto(false)}
        actions={
          <>
            <GhostButton onClick={() => setConfirmarResetAberto(false)} disabled={resetandoSenha}>
              Cancelar
            </GhostButton>
            <PrimaryButton variant="danger" onClick={() => void solicitarResetSenha()} disabled={resetandoSenha}>
              {resetandoSenha ? "A enviar…" : "Confirmar"}
            </PrimaryButton>
          </>
        }
      />
    </div>
  );
}
