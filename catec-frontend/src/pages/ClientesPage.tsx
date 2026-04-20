import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import FieldControl from "../components/form/FieldControl";
import "./ClientesPage.css";

type TipoPessoa = "PF" | "PJ";

type Cliente = {
  id: number;
  tipoPessoa: TipoPessoa;
  razaoSocialOuNome: string;
  nomeFantasia: string | null;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  enderecoLogradouro: string | null;
  enderecoCidade: string | null;
  enderecoUf: string | null;
  enderecoCep: string | null;
  observacoes: string | null;
};

type FormState = {
  tipoPessoa: TipoPessoa;
  razaoSocialOuNome: string;
  nomeFantasia: string;
  documento: string;
  email: string;
  telefone: string;
  enderecoLogradouro: string;
  enderecoCidade: string;
  enderecoUf: string;
  enderecoCep: string;
  observacoes: string;
};

const EMPTY_FORM: FormState = {
  tipoPessoa: "PF",
  razaoSocialOuNome: "",
  nomeFantasia: "",
  documento: "",
  email: "",
  telefone: "",
  enderecoLogradouro: "",
  enderecoCidade: "",
  enderecoUf: "",
  enderecoCep: "",
  observacoes: "",
};

function fromCliente(c: Cliente): FormState {
  return {
    tipoPessoa: c.tipoPessoa,
    razaoSocialOuNome: c.razaoSocialOuNome,
    nomeFantasia: c.nomeFantasia ?? "",
    documento: c.documento ?? "",
    email: c.email ?? "",
    telefone: c.telefone ?? "",
    enderecoLogradouro: c.enderecoLogradouro ?? "",
    enderecoCidade: c.enderecoCidade ?? "",
    enderecoUf: c.enderecoUf ?? "",
    enderecoCep: c.enderecoCep ?? "",
    observacoes: c.observacoes ?? "",
  };
}

function IconEdit() {
  return (
    <svg className="clientes-btn-edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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

export default function ClientesPage() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [lista, setLista] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"" | TipoPessoa>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modo, setModo] = useState<"criar" | "editar">("criar");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [confirmarRemocaoId, setConfirmarRemocaoId] = useState<number | null>(null);

  const deferredNome = useDeferredValue(filtroNome);
  const deferredDocumento = useDeferredValue(filtroDocumento);
  const filtrosDigitacaoPendentes = filtroNome !== deferredNome || filtroDocumento !== deferredDocumento;

  const listaFiltrada = useMemo(() => {
    const nome = deferredNome.trim().toLowerCase();
    const doc = deferredDocumento.trim().toLowerCase();
    return lista.filter((c) => {
      if (nome && !c.razaoSocialOuNome.toLowerCase().includes(nome)) return false;
      if (doc && !(c.documento ?? "").toLowerCase().includes(doc)) return false;
      if (filtroTipo && c.tipoPessoa !== filtroTipo) return false;
      return true;
    });
  }, [deferredDocumento, deferredNome, filtroTipo, lista]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiFetch("/api/v1/admin/clientes");
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        setErro("Você não tem permissão para gerenciar clientes.");
        setLista([]);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ao carregar clientes (${res.status})`);
        setLista([]);
        return;
      }
      setLista((await res.json()) as Cliente[]);
    } catch {
      setErro("Falha de rede ao carregar clientes.");
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (isAdmin) void carregar();
  }, [carregar, isAdmin]);

  useEffect(() => {
    if (!sucesso) return;
    const t = window.setTimeout(() => setSucesso(null), 6000);
    return () => window.clearTimeout(t);
  }, [sucesso]);

  function limparFiltros() {
    setFiltroNome("");
    setFiltroDocumento("");
    setFiltroTipo("");
  }

  function abrirCriar() {
    setErro(null);
    setSucesso(null);
    setModo("criar");
    setEditandoId(null);
    setForm(EMPTY_FORM);
    setConfirmarRemocaoId(null);
    setModalAberto(true);
  }

  function abrirEditar(cliente: Cliente) {
    setErro(null);
    setSucesso(null);
    setModo("editar");
    setEditandoId(cliente.id);
    setForm(fromCliente(cliente));
    setConfirmarRemocaoId(null);
    setModalAberto(true);
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        tipoPessoa: form.tipoPessoa,
        razaoSocialOuNome: form.razaoSocialOuNome,
        nomeFantasia: form.nomeFantasia.trim() || null,
        documento: form.documento.trim() || null,
        email: form.email.trim() || null,
        telefone: form.telefone.trim() || null,
        enderecoLogradouro: form.enderecoLogradouro.trim() || null,
        enderecoCidade: form.enderecoCidade.trim() || null,
        enderecoUf: form.enderecoUf.trim().toUpperCase() || null,
        enderecoCep: form.enderecoCep.trim() || null,
        observacoes: form.observacoes.trim() || null,
      };
      const path = modo === "criar" ? "/api/v1/admin/clientes" : `/api/v1/admin/clientes/${editandoId}`;
      const method = modo === "criar" ? "POST" : "PUT";
      const res = await apiFetch(path, { method, body: JSON.stringify(payload) });
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ao salvar cliente (${res.status})`);
        return;
      }
      setModalAberto(false);
      setConfirmarRemocaoId(null);
      setSucesso(modo === "criar" ? "Cliente criado com sucesso." : "Cliente atualizado com sucesso.");
      await carregar();
    } catch {
      setErro("Falha de rede ao salvar cliente.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: number) {
    setExcluindoId(id);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/admin/clientes/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ao remover cliente (${res.status})`);
        return;
      }
      if (editandoId === id) {
        setModalAberto(false);
      }
      setConfirmarRemocaoId(null);
      setSucesso("Cliente removido com sucesso.");
      await carregar();
    } catch {
      setErro("Falha de rede ao remover cliente.");
    } finally {
      setExcluindoId(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="clientes-page">
        <div className="clientes-page-inner">
          <div className="clientes-card clientes-card--denied">
            <h1 className="clientes-title">Clientes</h1>
            <p>Seu perfil não inclui permissão de administrador técnico para esta tela.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="clientes-page">
      {sucesso ? (
        <div className="clientes-toast-wrap" role="status" aria-live="polite">
          <div className="clientes-alert clientes-alert--success clientes-alert--toast">
            <span>{sucesso}</span>
            <button
              type="button"
              className="clientes-alert-dismiss clientes-alert-dismiss--icon"
              onClick={() => setSucesso(null)}
              aria-label="Fechar notificação"
              title="Fechar"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      <div className="clientes-page-inner clientes-page-stack">
        <header className="clientes-toolbar">
          <div className="clientes-toolbar-text">
            <h1 className="clientes-title">Clientes</h1>
            <p className="clientes-subtitle">Gestão de clientes</p>
          </div>
          <button type="button" className="clientes-btn-primary clientes-btn-cta" onClick={abrirCriar}>
            Novo cliente
          </button>
        </header>

        {erro && !modalAberto ? <div className="clientes-alert clientes-alert--error">{erro}</div> : null}

        <section className="clientes-card clientes-card--filters" aria-labelledby="clientes-filtros-heading">
          <div className="clientes-filters-head">
            <h2 id="clientes-filtros-heading" className="clientes-filters-title">
              Filtros
            </h2>
            <button type="button" className="clientes-link-clear" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
          <div className="clientes-filters-grid">
            <div>
              <label className="clientes-filter-label" htmlFor="flt-cliente-nome">
                Nome / Razão social
              </label>
              <FieldControl
                id="flt-cliente-nome"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="clientes-input"
                variant="compact"
                placeholder="Buscar por nome"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="clientes-filter-label" htmlFor="flt-cliente-documento">
                Documento
              </label>
              <FieldControl
                id="flt-cliente-documento"
                value={filtroDocumento}
                onChange={(e) => setFiltroDocumento(e.target.value)}
                className="clientes-input"
                variant="compact"
                placeholder="Buscar por documento"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="clientes-filter-label" htmlFor="flt-cliente-tipo">
                Tipo
              </label>
              <FieldControl
                as="select"
                id="flt-cliente-tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as "" | TipoPessoa)}
                className="clientes-select"
                variant="compact"
              >
                <option value="">Todos</option>
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </FieldControl>
            </div>
          </div>
        </section>

        <section className="clientes-card clientes-card--table" aria-busy={carregando}>
          {carregando ? (
            <div className="clientes-loading">
              <div className="clientes-spinner" aria-hidden />
              <p className="clientes-loading-text">Carregando lista...</p>
            </div>
          ) : lista.length === 0 ? (
            <div className="clientes-empty clientes-empty--standalone" role="status">
              <p className="clientes-empty-title">Nenhum cliente</p>
              <p className="clientes-empty-text">Ainda não há clientes cadastrados no sistema.</p>
            </div>
          ) : (
            <div className={`clientes-table-wrap${filtrosDigitacaoPendentes ? " clientes-table-wrap--filter-pending" : ""}`}>
              <table className="clientes-table">
                <thead>
                  <tr>
                    <th scope="col">Nome / Razão social</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Documento</th>
                    <th scope="col">E-mail</th>
                    <th scope="col" className="clientes-th-actions">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listaFiltrada.length === 0 ? (
                    <tr className="clientes-table-empty-row">
                      <td colSpan={5}>
                        <p className="clientes-filter-empty" role="status">
                          Não há clientes que correspondam aos filtros.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    listaFiltrada.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`clientes-table-data-row${idx % 2 === 1 ? " clientes-table-data-row--alt" : ""}`}
                        onClick={() => abrirEditar(c)}
                      >
                        <td className="clientes-td-nome">{c.razaoSocialOuNome}</td>
                        <td>{c.tipoPessoa}</td>
                        <td>{c.documento ?? "-"}</td>
                        <td className="clientes-td-email">{c.email ?? "-"}</td>
                        <td className="clientes-td-actions">
                          <button
                            type="button"
                            className="clientes-btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirEditar(c);
                            }}
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
          className="clientes-modal-backdrop"
          role="presentation"
          onClick={() => {
            if (salvando || excluindoId != null) return;
            setModalAberto(false);
            setConfirmarRemocaoId(null);
          }}
        >
          <div className="clientes-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="clientes-modal-titulo">
            <h2 id="clientes-modal-titulo" className="clientes-modal-title">
              {modo === "criar" ? "Novo cliente" : "Editar cliente"}
            </h2>
            {erro ? <div className="clientes-alert clientes-alert--error">{erro}</div> : null}

            <div className="clientes-modal-section">
              <h3 className="clientes-modal-section-title">Identificação</h3>
              <label className="clientes-label" htmlFor="cf-tipo">
                Tipo de pessoa
              </label>
              <FieldControl
                as="select"
                id="cf-tipo"
                value={form.tipoPessoa}
                onChange={(e) => setForm((f) => ({ ...f, tipoPessoa: e.target.value as TipoPessoa }))}
                className="clientes-select"
                variant="modal"
                disabled={salvando || excluindoId != null}
              >
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </FieldControl>
              <label className="clientes-label" htmlFor="cf-razao">
                Nome / Razão social
              </label>
              <FieldControl
                id="cf-razao"
                value={form.razaoSocialOuNome}
                onChange={(e) => setForm((f) => ({ ...f, razaoSocialOuNome: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || excluindoId != null}
              />
              <label className="clientes-label" htmlFor="cf-fantasia">
                Nome fantasia
              </label>
              <FieldControl
                id="cf-fantasia"
                value={form.nomeFantasia}
                onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || excluindoId != null}
              />
              <label className="clientes-label" htmlFor="cf-documento">
                Documento
              </label>
              <FieldControl
                id="cf-documento"
                value={form.documento}
                onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || excluindoId != null}
              />
            </div>

            <div className="clientes-modal-section">
              <h3 className="clientes-modal-section-title">Contato e endereço</h3>
              <label className="clientes-label" htmlFor="cf-email">
                E-mail
              </label>
              <FieldControl
                id="cf-email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || excluindoId != null}
              />
              <label className="clientes-label" htmlFor="cf-telefone">
                Telefone
              </label>
              <FieldControl
                id="cf-telefone"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || excluindoId != null}
              />
              <label className="clientes-label" htmlFor="cf-logradouro">
                Logradouro
              </label>
              <FieldControl
                id="cf-logradouro"
                value={form.enderecoLogradouro}
                onChange={(e) => setForm((f) => ({ ...f, enderecoLogradouro: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || excluindoId != null}
              />
              <div className="clientes-modal-grid-2">
                <div>
                  <label className="clientes-label" htmlFor="cf-cidade">
                    Cidade
                  </label>
                  <FieldControl
                    id="cf-cidade"
                    value={form.enderecoCidade}
                    onChange={(e) => setForm((f) => ({ ...f, enderecoCidade: e.target.value }))}
                    className="clientes-input"
                    variant="modal"
                    disabled={salvando || excluindoId != null}
                  />
                </div>
                <div>
                  <label className="clientes-label" htmlFor="cf-uf">
                    UF
                  </label>
                  <FieldControl
                    id="cf-uf"
                    value={form.enderecoUf}
                    onChange={(e) => setForm((f) => ({ ...f, enderecoUf: e.target.value }))}
                    className="clientes-input"
                    variant="modal"
                    disabled={salvando || excluindoId != null}
                    maxLength={2}
                  />
                </div>
              </div>
              <label className="clientes-label" htmlFor="cf-cep">
                CEP
              </label>
              <FieldControl
                id="cf-cep"
                value={form.enderecoCep}
                onChange={(e) => setForm((f) => ({ ...f, enderecoCep: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || excluindoId != null}
              />
              <label className="clientes-label" htmlFor="cf-observacoes">
                Observações
              </label>
              <FieldControl
                as="textarea"
                id="cf-observacoes"
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                className="clientes-input clientes-textarea"
                variant="modal"
                disabled={salvando || excluindoId != null}
              />
            </div>

            <div className="clientes-modal-actions">
              {modo === "editar" && editandoId != null ? (
                <button
                  type="button"
                  className="clientes-btn-ghost clientes-btn-danger-ghost"
                  onClick={() => setConfirmarRemocaoId(editandoId)}
                  disabled={salvando || excluindoId != null}
                >
                  Remover
                </button>
              ) : null}
              <button
                type="button"
                className="clientes-btn-ghost"
                onClick={() => {
                  setModalAberto(false);
                  setConfirmarRemocaoId(null);
                }}
                disabled={salvando || excluindoId != null}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="clientes-btn-primary"
                onClick={() => void salvar()}
                disabled={salvando || excluindoId != null}
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmarRemocaoId != null ? (
        <div className="clientes-modal-backdrop" role="presentation" onClick={() => excluindoId == null && setConfirmarRemocaoId(null)}>
          <div
            className="clientes-modal clientes-modal--confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clientes-confirm-remocao"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="clientes-confirm-remocao" className="clientes-modal-title">
              Confirmar remoção
            </h2>
            <p className="clientes-confirm-copy">Esta ação remove o cliente do cadastro. Deseja continuar?</p>
            <div className="clientes-modal-actions">
              <button type="button" className="clientes-btn-ghost" onClick={() => setConfirmarRemocaoId(null)} disabled={excluindoId != null}>
                Cancelar
              </button>
              <button
                type="button"
                className="clientes-btn-primary clientes-btn-danger"
                onClick={() => void remover(confirmarRemocaoId)}
                disabled={excluindoId != null}
              >
                {excluindoId != null ? "Removendo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
