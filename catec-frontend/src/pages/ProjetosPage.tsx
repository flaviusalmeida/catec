import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import GhostButton from "../components/buttons/GhostButton";
import PrimaryButton from "../components/buttons/PrimaryButton";
import FieldControl from "../components/form/FieldControl";
import FormField from "../components/form/FormField";
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
import ToastAlert from "../components/ui/ToastAlert";
import "../styles/admin-crud-table.css";
import { onlyDigits } from "../utils/digitsOnly";
import { formatTelefoneBrasil } from "../utils/telefoneBrasil";
import type { ClienteResumo, Projeto, ProjetoStatus } from "./projetoTypes";
import { STATUS_PROJETO_ROTULO } from "./projetoTypes";
import "./ClientesPage.css";
import "./ProjetosPage.css";

type Modo = "criar" | "editar";

type FormState = {
  clienteId: string;
  titulo: string;
  escopo: string;
  emailContato: string;
  telefone: string;
  status: ProjetoStatus;
};

function emptyForm(): FormState {
  return {
    clienteId: "",
    titulo: "",
    escopo: "",
    emailContato: "",
    telefone: "",
    status: "CRIADO",
  };
}

function formFromProjeto(p: Projeto): FormState {
  return {
    clienteId: String(p.clienteId),
    titulo: p.titulo,
    escopo: p.escopo,
    emailContato: p.emailContato,
    telefone: p.telefoneContato ? formatTelefoneBrasil(p.telefoneContato) : "",
    status: p.status,
  };
}

function statusBadgeClass(s: ProjetoStatus): string {
  if (s === "CRIADO") return "projetos-status projetos-status--criado";
  if (s === "AGUARDANDO_ADM") return "projetos-status projetos-status--adm";
  return "projetos-status projetos-status--proposta";
}

function podeEditarCampos(p: Projeto | null, userId: number | undefined, isAdmin: boolean): boolean {
  if (!p || userId == null) return false;
  if (isAdmin) return true;
  return p.criadoPorId === userId && p.status === "CRIADO";
}

export default function ProjetosPage() {
  const { user, isAdmin, podeGerirProjetos, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lista, setLista] = useState<Projeto[]>([]);
  const [clientesResumo, setClientesResumo] = useState<ClienteResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"" | ProjetoStatus>("");
  const deferredTitulo = useDeferredValue(filtroTitulo);
  const filtrosDigitacaoPendentes = filtroTitulo !== deferredTitulo;

  const [modalAberto, setModalAberto] = useState(false);
  const [modo, setModo] = useState<Modo>("criar");
  const [editando, setEditando] = useState<Projeto | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [modalErro, setModalErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const listaFiltrada = useMemo(() => {
    const t = deferredTitulo.trim().toLowerCase();
    return lista.filter((p) => {
      if (t && !p.titulo.toLowerCase().includes(t)) return false;
      if (filtroStatus && p.status !== filtroStatus) return false;
      return true;
    });
  }, [deferredTitulo, filtroStatus, lista]);

  const carregarClientesResumo = useCallback(async () => {
    try {
      const res = await apiFetch("/api/v1/clientes-resumo");
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) {
        return;
      }
      setClientesResumo((await res.json()) as ClienteResumo[]);
    } catch {
      /* ignorar: modal pode abrir sem combo se falhar */
    }
  }, [logout, navigate]);

  const carregarProjetos = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiFetch("/api/v1/projetos");
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        setErro("Você não tem permissão para consultar projetos.");
        setLista([]);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ao carregar projetos (${res.status})`);
        setLista([]);
        return;
      }
      setLista((await res.json()) as Projeto[]);
    } catch {
      setErro("Falha de rede ao carregar projetos.");
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (podeGerirProjetos) void carregarProjetos();
  }, [carregarProjetos, podeGerirProjetos]);

  useEffect(() => {
    if (!sucesso) return;
    const timer = window.setTimeout(() => setSucesso(null), 6000);
    return () => window.clearTimeout(timer);
  }, [sucesso]);

  useEffect(() => {
    const msg = (location.state as { sucesso?: string } | null)?.sucesso;
    if (msg) {
      setSucesso(msg);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  function limparFiltros() {
    setFiltroTitulo("");
    setFiltroStatus("");
  }

  async function garantirClientesResumo() {
    if (clientesResumo.length === 0) {
      await carregarClientesResumo();
    }
  }

  async function abrirNovo() {
    setModo("criar");
    setEditando(null);
    setForm(emptyForm());
    setModalErro(null);
    await garantirClientesResumo();
    setModalAberto(true);
  }

  async function abrirEditar(p: Projeto) {
    setModo("editar");
    setEditando(p);
    setForm(formFromProjeto(p));
    setModalErro(null);
    await garantirClientesResumo();
    setModalAberto(true);
  }

  async function salvar() {
    setModalErro(null);
    const titulo = form.titulo.trim();
    const escopo = form.escopo.trim();
    const email = form.emailContato.trim();
    if (!titulo || !escopo || !email) {
      setModalErro("Preencha título, escopo e e-mail de contacto.");
      return;
    }
    const cid = Number.parseInt(form.clienteId, 10);
    if (modo === "criar" && (Number.isNaN(cid) || cid < 1)) {
      setModalErro("Selecione um cliente.");
      return;
    }

    const telefoneDigits = onlyDigits(form.telefone);
    const telefonePayload = telefoneDigits.length > 0 ? telefoneDigits : null;

    setSalvando(true);
    try {
      if (modo === "criar") {
        const res = await apiFetch("/api/v1/projetos", {
          method: "POST",
          body: JSON.stringify({
            clienteId: cid,
            titulo,
            escopo,
            emailContato: email,
            telefoneContato: telefonePayload,
          }),
        });
        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setModalErro(body?.mensagem ?? `Erro ao criar (${res.status})`);
          return;
        }
        setModalAberto(false);
        setSucesso("Projeto criado com sucesso.");
        await carregarProjetos();
        return;
      }

      if (editando == null) return;

      const podeCampos = podeEditarCampos(editando, user?.id, isAdmin);
      const body: Record<string, unknown> = {};

      if (podeCampos) {
        body.titulo = titulo;
        body.escopo = escopo;
        body.emailContato = email;
        body.telefoneContato = telefonePayload;
      }
      if (isAdmin) {
        body.clienteId = Number.isNaN(cid) ? editando.clienteId : cid;
        if (form.status !== editando.status) {
          body.status = form.status;
        } else {
          body.status = null;
        }
      } else {
        body.clienteId = null;
        body.status = null;
      }

      const res = await apiFetch(`/api/v1/projetos/${editando.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        setModalErro(b?.mensagem ?? `Erro ao atualizar (${res.status})`);
        return;
      }
      setModalAberto(false);
      setSucesso("Projeto atualizado com sucesso.");
      await carregarProjetos();
    } catch {
      setModalErro("Falha de rede ao guardar.");
    } finally {
      setSalvando(false);
    }
  }

  const camposEditaveis = editando == null ? true : podeEditarCampos(editando, user?.id, isAdmin);
  const somenteLeitura = modo === "editar" && !camposEditaveis && !isAdmin;

  if (!podeGerirProjetos) {
    return (
      <div className="clientes-page">
        <div className="clientes-page-inner">
          <AccessDeniedCard
            titleId="projetos-acesso-negado"
            title="Projetos"
            message="A abertura de demandas está disponível para colaboradores e equipa administrativa."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="clientes-page">
      <ToastAlert
        open={Boolean(sucesso)}
        variant="success"
        onDismiss={() => setSucesso(null)}
        dismissAriaLabel="Fechar notificação"
        dismissTitle="Fechar"
      >
        {sucesso}
      </ToastAlert>

      <div className="clientes-page-inner clientes-page-stack">
        <PageToolbar
          title="Projetos"
          subtitle="Demandas iniciais vinculadas a cliente."
          actions={
            <PrimaryButton variant="toolbar" onClick={() => void abrirNovo()}>
              Novo projeto
            </PrimaryButton>
          }
        />

        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

        <FiltersCard headingId="projetos-filtros-heading" onClear={limparFiltros}>
          <div>
            <label className="filters-card__label" htmlFor="flt-proj-titulo">
              Título
            </label>
            <FieldControl
              id="flt-proj-titulo"
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
              className="clientes-input"
              variant="compact"
              placeholder="Filtrar por título"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="filters-card__label" htmlFor="flt-proj-status">
              Estado
            </label>
            <FieldControl
              as="select"
              id="flt-proj-status"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as "" | ProjetoStatus)}
              className="clientes-select"
              variant="compact"
            >
              <option value="">Todos</option>
              <option value="CRIADO">Criado</option>
              <option value="AGUARDANDO_ADM">Aguardando administrativo</option>
              <option value="EM_PROPOSTA">Em proposta</option>
            </FieldControl>
          </div>
        </FiltersCard>

        <DataTableSection
          loading={carregando}
          loadingLabel="Carregando projetos…"
          empty={lista.length === 0}
          emptyTitle="Nenhum projeto"
          emptyDescription="Ainda não há demandas registadas."
          filterPending={filtrosDigitacaoPendentes}
        >
          <table className="admin-crud-table projetos-data-table">
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Cliente</th>
                <th scope="col">Estado</th>
                <th scope="col">Criado por</th>
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
                      Não há projetos que correspondam aos filtros.
                    </p>
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`admin-crud-table__row${idx % 2 === 1 ? " admin-crud-table__row--alt" : ""}`}
                    onClick={() => void abrirEditar(p)}
                  >
                    <td className="admin-crud-table__cell-primary">{p.titulo}</td>
                    <td>{p.clienteNome}</td>
                    <td>
                      <span className={statusBadgeClass(p.status)}>{STATUS_PROJETO_ROTULO[p.status]}</span>
                    </td>
                    <td className="admin-crud-table__cell-muted">{p.criadoPorNome}</td>
                    <td className="admin-crud-table__td-actions">
                      <RowEditButton
                        ariaLabel={`Abrir ${p.titulo}`}
                        onClick={() => void abrirEditar(p)}
                      />
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
        titleId="projetos-modal-titulo"
        title={
          modo === "criar"
            ? "Novo projeto"
            : somenteLeitura
              ? "Ver projeto"
              : "Editar projeto"
        }
        onBackdropClick={() => {
          if (salvando) return;
          setModalAberto(false);
        }}
      >
        {modalErro ? <InlineAlert variant="error">{modalErro}</InlineAlert> : null}
        {somenteLeitura ? (
          <p className="admin-crud-table__filter-msg" role="status">
            Esta demanda já seguiu o fluxo. Só o administrativo pode alterar estado e dados.
          </p>
        ) : null}

        <ModalSection title="Identificação" titleId="proj-modal-ident">
          <ModalFormGrid balanced>
            <FormField label="Cliente" htmlFor="pf-cliente" required={modo === "criar"}>
              <FieldControl
                as="select"
                id="pf-cliente"
                value={form.clienteId}
                onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}
                className="clientes-select"
                variant="modal"
                disabled={salvando || (modo === "editar" && !isAdmin) || somenteLeitura}
                required={modo === "criar"}
                aria-required={modo === "criar"}
              >
                {modo === "criar" ? (
                  <option value="">Selecione…</option>
                ) : null}
                {clientesResumo.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.razaoSocialOuNome}
                  </option>
                ))}
              </FieldControl>
            </FormField>
            <FormField label="Título" htmlFor="pf-titulo" required>
              <FieldControl
                id="pf-titulo"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || (!camposEditaveis && modo === "editar")}
                required
                aria-required="true"
              />
            </FormField>
          </ModalFormGrid>
        </ModalSection>

        <ModalSection title="Escopo" titleId="proj-modal-escopo">
          <FormField label="Descrição do pedido" htmlFor="pf-escopo" required>
            <FieldControl
              as="textarea"
              id="pf-escopo"
              value={form.escopo}
              onChange={(e) => setForm((f) => ({ ...f, escopo: e.target.value }))}
              className="clientes-input clientes-textarea"
              variant="modal"
              disabled={salvando || (!camposEditaveis && modo === "editar")}
              required
              aria-required="true"
            />
          </FormField>
        </ModalSection>

        <ModalSection title="Contacto inicial" titleId="proj-modal-contato">
          <ModalFormGrid balanced>
            <FormField label="E-mail" htmlFor="pf-email" required>
              <FieldControl
                id="pf-email"
                type="email"
                value={form.emailContato}
                onChange={(e) => setForm((f) => ({ ...f, emailContato: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || (!camposEditaveis && modo === "editar")}
                required
                aria-required="true"
              />
            </FormField>
            <FormField label="Telefone" htmlFor="pf-tel">
              <FieldControl
                id="pf-tel"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.telefone}
                onChange={(e) => {
                  const d = onlyDigits(e.target.value).slice(0, 11);
                  setForm((f) => ({ ...f, telefone: d ? formatTelefoneBrasil(d) : "" }));
                }}
                className="clientes-input"
                variant="modal"
                disabled={salvando || (!camposEditaveis && modo === "editar")}
                placeholder="(00) 00000-0000"
              />
            </FormField>
          </ModalFormGrid>
        </ModalSection>

        {modo === "editar" && isAdmin ? (
          <ModalSection title="Estado do fluxo" titleId="proj-modal-status">
            <FormField label="Estado" htmlFor="pf-status">
              <FieldControl
                as="select"
                id="pf-status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjetoStatus }))}
                className="clientes-select"
                variant="modal"
                disabled={salvando}
              >
                <option value="CRIADO">{STATUS_PROJETO_ROTULO.CRIADO}</option>
                <option value="AGUARDANDO_ADM">{STATUS_PROJETO_ROTULO.AGUARDANDO_ADM}</option>
                <option value="EM_PROPOSTA">{STATUS_PROJETO_ROTULO.EM_PROPOSTA}</option>
              </FieldControl>
            </FormField>
            <p className="admin-crud-table__filter-msg" role="note">
              Transições válidas: Criado → Aguardando administrativo → Em proposta. Alterações inválidas são rejeitadas pelo servidor.
            </p>
          </ModalSection>
        ) : null}

        <ModalFooter>
          <GhostButton onClick={() => setModalAberto(false)} disabled={salvando}>
            {somenteLeitura ? "Fechar" : "Cancelar"}
          </GhostButton>
          {somenteLeitura ? null : (
            <PrimaryButton onClick={() => void salvar()} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </PrimaryButton>
          )}
        </ModalFooter>
      </FormDialog>
    </div>
  );
}
