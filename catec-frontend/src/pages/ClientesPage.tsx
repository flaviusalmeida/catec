import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import FieldControl from "../components/form/FieldControl";
import PrimaryButton from "../components/buttons/PrimaryButton";
import DataTableSection from "../components/layout/DataTableSection";
import AccessDeniedCard from "../components/ui/AccessDeniedCard";
import InlineAlert from "../components/ui/InlineAlert";
import ToastAlert from "../components/ui/ToastAlert";
import FiltersCard from "../components/layout/FiltersCard";
import PageToolbar from "../components/layout/PageToolbar";
import RowEditButton from "../components/table/RowEditButton";
import "../styles/admin-crud-table.css";
import { formatDocumentoByTipo, onlyDigits } from "../utils/cpfCnpj";
import { formatTelefoneBrasil } from "../utils/telefoneBrasil";
import type { Cliente, TipoPessoa } from "./clienteTypes";
import "./ClientesPage.css";

function documentoParaExibicao(c: Cliente): string {
  const d = onlyDigits(c.documento ?? "");
  return d ? formatDocumentoByTipo(c.tipoPessoa, d) : "—";
}

export default function ClientesPage() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lista, setLista] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"" | TipoPessoa>("");

  const deferredNome = useDeferredValue(filtroNome);
  const deferredDocumento = useDeferredValue(filtroDocumento);
  const filtrosDigitacaoPendentes = filtroNome !== deferredNome || filtroDocumento !== deferredDocumento;

  const listaFiltrada = useMemo(() => {
    const nome = deferredNome.trim().toLowerCase();
    const docDigits = onlyDigits(deferredDocumento);
    return lista.filter((c) => {
      if (nome && !c.razaoSocialOuNome.toLowerCase().includes(nome)) return false;
      if (docDigits) {
        const rowDigits = onlyDigits(c.documento ?? "");
        if (!rowDigits.includes(docDigits)) return false;
      }
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

  useEffect(() => {
    const msg = (location.state as { sucesso?: string } | null)?.sucesso;
    if (msg) {
      setSucesso(msg);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  function limparFiltros() {
    setFiltroNome("");
    setFiltroDocumento("");
    setFiltroTipo("");
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
            <PrimaryButton variant="toolbar" onClick={() => navigate("/app/clientes/novo")}>
              Novo cliente
            </PrimaryButton>
          }
        />

        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

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
              CPF/CNPJ
            </label>
            <FieldControl
              id="flt-cliente-documento"
              value={filtroDocumento}
              onChange={(e) => setFiltroDocumento(e.target.value)}
              className="clientes-input"
              variant="compact"
              placeholder="Buscar por CPF ou CNPJ"
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
                <th scope="col">CPF/CNPJ</th>
                <th scope="col">Telefone</th>
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
                    onClick={() => navigate(`/app/clientes/${c.id}/editar`)}
                  >
                    <td className="admin-crud-table__cell-primary">{c.razaoSocialOuNome}</td>
                    <td>{documentoParaExibicao(c)}</td>
                    <td className="admin-crud-table__cell-muted">
                      {c.telefone ? formatTelefoneBrasil(c.telefone) : "—"}
                    </td>
                    <td className="admin-crud-table__cell-muted">{c.email ?? "-"}</td>
                    <td className="admin-crud-table__td-actions">
                      <RowEditButton
                        ariaLabel={`Editar ${c.razaoSocialOuNome}`}
                        onClick={() => navigate(`/app/clientes/${c.id}/editar`)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataTableSection>
      </div>
    </div>
  );
}
