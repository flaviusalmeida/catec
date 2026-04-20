import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import FieldControl from "../components/form/FieldControl";
import FormField from "../components/form/FormField";
import GhostButton from "../components/buttons/GhostButton";
import PrimaryButton from "../components/buttons/PrimaryButton";
import DataTableSection from "../components/layout/DataTableSection";
import ConfirmDialog from "../components/layout/ConfirmDialog";
import AccessDeniedCard from "../components/ui/AccessDeniedCard";
import InlineAlert from "../components/ui/InlineAlert";
import ToastAlert from "../components/ui/ToastAlert";
import FormDialog from "../components/layout/FormDialog";
import ModalFooter from "../components/layout/ModalFooter";
import ModalFormGrid from "../components/layout/ModalFormGrid";
import ModalSection from "../components/layout/ModalSection";
import FiltersCard from "../components/layout/FiltersCard";
import PageToolbar from "../components/layout/PageToolbar";
import RowEditButton from "../components/table/RowEditButton";
import "../styles/admin-crud-table.css";
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
          <AccessDeniedCard
            titleId="clientes-acesso-negado"
            title="Clientes"
            message="Seu perfil não inclui permissão de administrador técnico para esta tela."
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
          title="Clientes"
          subtitle="Gestão de clientes."
          actions={
            <PrimaryButton variant="toolbar" onClick={abrirCriar}>
              Novo cliente
            </PrimaryButton>
          }
        />

        {erro && !modalAberto ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

        <FiltersCard headingId="clientes-filtros-heading" onClear={limparFiltros}>
          <div>
            <label className="filters-card__label" htmlFor="flt-cliente-nome">
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
            <label className="filters-card__label" htmlFor="flt-cliente-documento">
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
            <label className="filters-card__label" htmlFor="flt-cliente-tipo">
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
        </FiltersCard>

        <DataTableSection
          loading={carregando}
          loadingLabel="Carregando lista..."
          empty={lista.length === 0}
          emptyTitle="Nenhum cliente"
          emptyDescription="Ainda não há clientes cadastrados no sistema."
          filterPending={filtrosDigitacaoPendentes}
        >
          <table className="admin-crud-table clientes-data-table">
            <thead>
              <tr>
                <th scope="col">Nome / Razão social</th>
                <th scope="col">Tipo</th>
                <th scope="col">Documento</th>
                <th scope="col">E-mail</th>
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
                      Não há clientes que correspondam aos filtros.
                    </p>
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`admin-crud-table__row${idx % 2 === 1 ? " admin-crud-table__row--alt" : ""}`}
                    onClick={() => abrirEditar(c)}
                  >
                    <td className="admin-crud-table__cell-primary">{c.razaoSocialOuNome}</td>
                    <td>{c.tipoPessoa}</td>
                    <td>{c.documento ?? "-"}</td>
                    <td className="admin-crud-table__cell-muted">{c.email ?? "-"}</td>
                    <td className="admin-crud-table__td-actions">
                      <RowEditButton
                        ariaLabel={`Editar ${c.razaoSocialOuNome}`}
                        onClick={() => abrirEditar(c)}
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
        titleId="clientes-modal-titulo"
        title={modo === "criar" ? "Novo cliente" : "Editar cliente"}
        onBackdropClick={() => {
          if (salvando || excluindoId != null) return;
          setModalAberto(false);
          setConfirmarRemocaoId(null);
        }}
      >
        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

        <ModalSection title="Identificação" titleId="cliente-modal-sec-ident">
          <FormField label="Tipo de pessoa" htmlFor="cf-tipo">
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
          </FormField>
          <FormField label="Nome / Razão social" htmlFor="cf-razao">
            <FieldControl
              id="cf-razao"
              value={form.razaoSocialOuNome}
              onChange={(e) => setForm((f) => ({ ...f, razaoSocialOuNome: e.target.value }))}
              className="clientes-input"
              variant="modal"
              disabled={salvando || excluindoId != null}
            />
          </FormField>
          <FormField label="Nome fantasia" htmlFor="cf-fantasia">
            <FieldControl
              id="cf-fantasia"
              value={form.nomeFantasia}
              onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
              className="clientes-input"
              variant="modal"
              disabled={salvando || excluindoId != null}
            />
          </FormField>
          <FormField label="Documento" htmlFor="cf-documento">
            <FieldControl
              id="cf-documento"
              value={form.documento}
              onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
              className="clientes-input"
              variant="modal"
              disabled={salvando || excluindoId != null}
            />
          </FormField>
        </ModalSection>

        <ModalSection title="Contato e endereço" titleId="cliente-modal-sec-contato">
          <FormField label="E-mail" htmlFor="cf-email">
            <FieldControl
              id="cf-email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="clientes-input"
              variant="modal"
              disabled={salvando || excluindoId != null}
            />
          </FormField>
          <FormField label="Telefone" htmlFor="cf-telefone">
            <FieldControl
              id="cf-telefone"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              className="clientes-input"
              variant="modal"
              disabled={salvando || excluindoId != null}
            />
          </FormField>
          <FormField label="Logradouro" htmlFor="cf-logradouro">
            <FieldControl
              id="cf-logradouro"
              value={form.enderecoLogradouro}
              onChange={(e) => setForm((f) => ({ ...f, enderecoLogradouro: e.target.value }))}
              className="clientes-input"
              variant="modal"
              disabled={salvando || excluindoId != null}
            />
          </FormField>
          <ModalFormGrid>
            <FormField label="Cidade" htmlFor="cf-cidade">
              <FieldControl
                id="cf-cidade"
                value={form.enderecoCidade}
                onChange={(e) => setForm((f) => ({ ...f, enderecoCidade: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || excluindoId != null}
              />
            </FormField>
            <FormField label="UF" htmlFor="cf-uf">
              <FieldControl
                id="cf-uf"
                value={form.enderecoUf}
                onChange={(e) => setForm((f) => ({ ...f, enderecoUf: e.target.value }))}
                className="clientes-input"
                variant="modal"
                disabled={salvando || excluindoId != null}
                maxLength={2}
              />
            </FormField>
          </ModalFormGrid>
          <FormField label="CEP" htmlFor="cf-cep">
            <FieldControl
              id="cf-cep"
              value={form.enderecoCep}
              onChange={(e) => setForm((f) => ({ ...f, enderecoCep: e.target.value }))}
              className="clientes-input"
              variant="modal"
              disabled={salvando || excluindoId != null}
            />
          </FormField>
          <FormField label="Observações" htmlFor="cf-observacoes">
            <FieldControl
              as="textarea"
              id="cf-observacoes"
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              className="clientes-input clientes-textarea"
              variant="modal"
              disabled={salvando || excluindoId != null}
            />
          </FormField>
        </ModalSection>

        <ModalFooter>
          {modo === "editar" && editandoId != null ? (
            <GhostButton variant="danger" onClick={() => setConfirmarRemocaoId(editandoId)} disabled={salvando || excluindoId != null}>
              Remover
            </GhostButton>
          ) : null}
          <GhostButton
            onClick={() => {
              setModalAberto(false);
              setConfirmarRemocaoId(null);
            }}
            disabled={salvando || excluindoId != null}
          >
            Cancelar
          </GhostButton>
          <PrimaryButton onClick={() => void salvar()} disabled={salvando || excluindoId != null}>
            {salvando ? "Salvando..." : "Salvar"}
          </PrimaryButton>
        </ModalFooter>
      </FormDialog>

      <ConfirmDialog
        open={confirmarRemocaoId != null}
        titleId="clientes-confirm-remocao"
        title="Confirmar remoção"
        description="Esta ação remove o cliente do cadastro. Deseja continuar?"
        onBackdropClick={() => excluindoId == null && setConfirmarRemocaoId(null)}
        actions={
          <>
            <GhostButton onClick={() => setConfirmarRemocaoId(null)} disabled={excluindoId != null}>
              Cancelar
            </GhostButton>
            <PrimaryButton
              variant="danger"
              onClick={() => confirmarRemocaoId != null && void remover(confirmarRemocaoId)}
              disabled={excluindoId != null}
            >
              {excluindoId != null ? "Removendo..." : "Confirmar"}
            </PrimaryButton>
          </>
        }
      />
    </div>
  );
}
