import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import ClienteAutocomplete from "../components/projeto/ClienteAutocomplete";
import ProjetoStatusBadge from "../components/projeto/ProjetoStatusBadge";
import GhostButton from "../components/buttons/GhostButton";
import PrimaryButton from "../components/buttons/PrimaryButton";
import FieldControl from "../components/form/FieldControl";
import FormField from "../components/form/FormField";
import DataTableSection from "../components/layout/DataTableSection";
import FiltersCard from "../components/layout/FiltersCard";
import FormDialog from "../components/layout/FormDialog";
import ModalFooter from "../components/layout/ModalFooter";
import ModalSection from "../components/layout/ModalSection";
import PageToolbar from "../components/layout/PageToolbar";
import RowEditButton from "../components/table/RowEditButton";
import AccessDeniedCard from "../components/ui/AccessDeniedCard";
import InlineAlert from "../components/ui/InlineAlert";
import ToastAlert from "../components/ui/ToastAlert";
import "../styles/admin-crud-table.css";
import { formatTelefoneBrasil } from "../utils/telefoneBrasil";
import type { ClienteResumo, Projeto, ProjetoStatus } from "./projetoTypes";
import { ORDEM_STATUS_PROJETO, STATUS_PROJETO_ROTULO, statusOpcoesFluxoAdmin } from "./projetoTypes";
import "./ClientesPage.css";
import "./ProjetosPage.css";

type Modo = "criar" | "editar";

type FormState = {
  clienteId: string;
  clienteBusca: string;
  titulo: string;
  escopo: string;
  status: ProjetoStatus;
};

function emptyForm(): FormState {
  return {
    clienteId: "",
    clienteBusca: "",
    titulo: "",
    escopo: "",
    status: "AGUARDANDO_PROPOSTA_COMERCIAL",
  };
}

function formFromProjeto(p: Projeto): FormState {
  return {
    clienteId: p.clienteId != null ? String(p.clienteId) : "",
    clienteBusca: p.clienteNome ?? "",
    titulo: p.titulo,
    escopo: p.escopo,
    status: p.status,
  };
}

function podeEditarCampos(p: Projeto | null, userId: number | undefined, isAdmin: boolean): boolean {
  if (!p || userId == null) return false;
  if (p.status === "PENDENTE_CLIENTE") return false;
  if (isAdmin) return true;
  return p.criadoPorId === userId && p.status === "AGUARDANDO_PROPOSTA_COMERCIAL";
}

function previewContatoCliente(
  modo: Modo,
  editando: Projeto | null,
  clienteSelecionado: ClienteResumo | null,
): ClienteResumo | null {
  if (clienteSelecionado) return clienteSelecionado;
  if (modo === "editar" && editando && editando.clienteId != null) {
    return {
      id: editando.clienteId,
      razaoSocialOuNome: editando.clienteNome ?? "",
      email: editando.emailContato,
      telefone: editando.telefoneContato,
    };
  }
  return null;
}

export default function ProjetosPage() {
  const { user, isAdmin, podeGerirProjetos, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lista, setLista] = useState<Projeto[]>([]);
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
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteResumo | null>(null);
  const [erroAutocompleteCliente, setErroAutocompleteCliente] = useState<string | null>(null);
  const [modalErro, setModalErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const previewCliente = useMemo(
    () => previewContatoCliente(modo, editando, clienteSelecionado),
    [modo, editando, clienteSelecionado],
  );

  const listaFiltrada = useMemo(() => {
    const t = deferredTitulo.trim().toLowerCase();
    return lista.filter((p) => {
      if (t && !p.titulo.toLowerCase().includes(t)) return false;
      if (filtroStatus && p.status !== filtroStatus) return false;
      return true;
    });
  }, [deferredTitulo, filtroStatus, lista]);

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

  function abrirNovo() {
    setModo("criar");
    setEditando(null);
    setForm(emptyForm());
    setClienteSelecionado(null);
    setModalErro(null);
    setErroAutocompleteCliente(null);
    setModalAberto(true);
  }

  function abrirEditar(p: Projeto) {
    setModo("editar");
    setEditando(p);
    setForm(formFromProjeto(p));
    setClienteSelecionado(null);
    setModalErro(null);
    setErroAutocompleteCliente(null);
    setModalAberto(true);
  }

  async function salvar() {
    setModalErro(null);
    const titulo = form.titulo.trim();
    const escopo = form.escopo.trim();
    if (!titulo || !escopo) {
      setModalErro("Preencha título e escopo.");
      return;
    }
    const cid = Number.parseInt(form.clienteId, 10);
    const temCliente = !Number.isNaN(cid) && cid >= 1;

    setSalvando(true);
    try {
      if (modo === "criar") {
        const body: Record<string, unknown> = { titulo, escopo };
        if (temCliente) {
          body.clienteId = cid;
        }
        const res = await apiFetch("/api/v1/projetos", {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) {
          const bodyJson = await res.json().catch(() => null);
          setModalErro(bodyJson?.mensagem ?? `Erro ao criar (${res.status})`);
          return;
        }
        setModalAberto(false);
        setSucesso(temCliente ? "Projeto criado com sucesso." : "Demanda registrada. Associe um cliente quando possível.");
        await carregarProjetos();
        return;
      }

      if (editando == null) return;

      if (editando.status === "PENDENTE_CLIENTE") {
        if (!temCliente) {
          setModalErro(null);
          return;
        }
        const emailAssoc = previewContatoCliente(modo, editando, clienteSelecionado)?.email?.trim();
        if (!emailAssoc) {
          setModalErro("O cliente selecionado precisa ter e-mail cadastrado para associar à demanda.");
          return;
        }
        const res = await apiFetch(`/api/v1/projetos/${editando.id}/cliente`, {
          method: "PUT",
          body: JSON.stringify({ clienteId: cid }),
        });
        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) {
          const b = await res.json().catch(() => null);
          setModalErro(b?.mensagem ?? `Erro ao associar cliente (${res.status})`);
          return;
        }
        setModalAberto(false);
        setSucesso("Cliente associado à demanda com sucesso.");
        await carregarProjetos();
        return;
      }

      const podeCampos = podeEditarCampos(editando, user?.id, isAdmin);
      const body: Record<string, unknown> = {};

      if (podeCampos) {
        body.titulo = titulo;
        body.escopo = escopo;
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
      setModalErro("Falha de rede ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  const pendenteCliente = modo === "editar" && editando?.status === "PENDENTE_CLIENTE";
  const podeAssociarCliente =
    pendenteCliente &&
    editando != null &&
    (isAdmin || (user?.id != null && editando.criadoPorId === user.id));

  const camposEditaveis = editando == null ? true : podeEditarCampos(editando, user?.id, isAdmin);
  const somenteLeitura =
    modo === "editar" && !isAdmin && (pendenteCliente ? !podeAssociarCliente : !camposEditaveis);

  if (!podeGerirProjetos) {
    return (
      <div className="clientes-page">
        <div className="clientes-page-inner">
          <AccessDeniedCard
            titleId="projetos-acesso-negado"
            title="Projetos"
            message="A abertura de demandas está disponível para colaboradores e equipe administrativa."
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
            <PrimaryButton variant="toolbar" onClick={abrirNovo}>
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
              Status
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
              {ORDEM_STATUS_PROJETO.map((s) => (
                <option key={s} value={s}>
                  {STATUS_PROJETO_ROTULO[s]}
                </option>
              ))}
            </FieldControl>
          </div>
        </FiltersCard>

        <DataTableSection
          loading={carregando}
          loadingLabel="Carregando projetos…"
          empty={lista.length === 0}
          emptyTitle="Nenhum projeto"
          emptyDescription="Ainda não há demandas registradas."
          filterPending={filtrosDigitacaoPendentes}
        >
          <table className="admin-crud-table projetos-data-table">
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Cliente</th>
                <th scope="col">Criado por</th>
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
                      Não há projetos que correspondam aos filtros.
                    </p>
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`admin-crud-table__row${idx % 2 === 1 ? " admin-crud-table__row--alt" : ""}`}
                    onClick={() => abrirEditar(p)}
                  >
                    <td className="admin-crud-table__cell-primary">{p.titulo}</td>
                    <td>{p.clienteNome ?? "—"}</td>
                    <td className="admin-crud-table__cell-muted">{p.criadoPorNome}</td>
                    <td>
                      <ProjetoStatusBadge status={p.status} />
                    </td>
                    <td className="admin-crud-table__td-actions">
                      <RowEditButton ariaLabel={`Abrir ${p.titulo}`} onClick={() => abrirEditar(p)} />
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
        panelClassName="projetos-form-dialog"
        title={
          modo === "criar"
            ? "Novo projeto"
            : pendenteCliente && podeAssociarCliente
              ? "Completar cadastro da demanda"
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
        {pendenteCliente && podeAssociarCliente ? (
          <InlineAlert variant="error">
            Este projeto está pendente do cadastro de um cliente. Associe um cliente para liberar título, descrição e fluxo.
          </InlineAlert>
        ) : null}
        {somenteLeitura ? (
          <p className="admin-crud-table__filter-msg" role="status">
            {pendenteCliente
              ? "Esta demanda está pendente de cliente. Só quem abriu a demanda ou o administrativo pode associar o cliente."
              : "Esta demanda já seguiu o fluxo. Só o administrativo pode alterar status e dados."}
          </p>
        ) : null}

        <ModalSection title="Identificação" titleId="proj-modal-ident">
          <div className="projetos-modal-ident-stack">
            <ClienteAutocomplete
              label="Cliente"
              required={pendenteCliente}
              disabled={
                salvando ||
                somenteLeitura ||
                (modo === "editar" && !pendenteCliente && !isAdmin)
              }
              valueId={form.clienteId}
              inputValue={form.clienteBusca}
              onInputValueChange={(clienteBusca) => setForm((f) => ({ ...f, clienteBusca }))}
              onSelect={(c) => {
                setClienteSelecionado(c);
                setForm((f) => ({ ...f, clienteId: String(c.id), clienteBusca: c.razaoSocialOuNome }));
              }}
              clearable={modo === "criar"}
              onClear={() => {
                setClienteSelecionado(null);
                setForm((f) => ({ ...f, clienteId: "", clienteBusca: "" }));
              }}
              fetchError={erroAutocompleteCliente}
              onFetchError={setErroAutocompleteCliente}
            />
            <FormField label="Título" htmlFor="pf-titulo" required>
              <FieldControl
                id="pf-titulo"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || (!camposEditaveis && modo === "editar") || pendenteCliente}
                required
                aria-required="true"
              />
            </FormField>
          </div>
        </ModalSection>

        {previewCliente ? (
          <ModalSection title="Contato do cliente" titleId="proj-modal-contato-cliente">
            {!previewCliente.email?.trim() ? (
              <InlineAlert variant="error">
                Este cliente não tem e-mail no cadastro. Complete o cadastro do cliente antes de salvar a demanda.
              </InlineAlert>
            ) : (
              <>
                <p className="projetos-contato-linha">
                  <strong>E-mail:</strong> {previewCliente.email}
                </p>
                <p className="projetos-contato-linha">
                  <strong>Telefone:</strong>{" "}
                  {previewCliente.telefone ? formatTelefoneBrasil(previewCliente.telefone) : "—"}
                </p>
              </>
            )}
          </ModalSection>
        ) : null}

        <div
          className={
            previewCliente
              ? "projetos-modal-escopo-block projetos-modal-escopo-block--after-contato"
              : "projetos-modal-escopo-block"
          }
        >
          <FormField label="Descrição" htmlFor="pf-escopo" required>
            <FieldControl
              as="textarea"
              id="pf-escopo"
              value={form.escopo}
              onChange={(e) => setForm((f) => ({ ...f, escopo: e.target.value }))}
              className="clientes-input clientes-textarea"
              variant="modal"
              disabled={salvando || (!camposEditaveis && modo === "editar") || pendenteCliente}
              required
              aria-required="true"
            />
          </FormField>
        </div>

            {modo === "editar" && isAdmin && editando?.status !== "PENDENTE_CLIENTE" ? (
          <ModalSection title="Status do fluxo" titleId="proj-modal-status">
            <FormField label="Status" htmlFor="pf-status">
              <FieldControl
                as="select"
                id="pf-status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjetoStatus }))}
                className="clientes-select"
                variant="modal"
                disabled={salvando}
              >
                {editando ? (
                  statusOpcoesFluxoAdmin(editando.status).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_PROJETO_ROTULO[s]}
                    </option>
                  ))
                ) : null}
              </FieldControl>
            </FormField>
          </ModalSection>
        ) : null}

        <ModalFooter>
          <GhostButton onClick={() => setModalAberto(false)} disabled={salvando}>
            {somenteLeitura ? "Fechar" : "Cancelar"}
          </GhostButton>
          {somenteLeitura ? null : (
            <PrimaryButton onClick={() => void salvar()} disabled={salvando}>
              {pendenteCliente && podeAssociarCliente
                ? salvando
                  ? "Associando…"
                  : "Associar cliente"
                : salvando
                  ? "Salvando…"
                  : "Salvar"}
            </PrimaryButton>
          )}
        </ModalFooter>
      </FormDialog>
    </div>
  );
}
