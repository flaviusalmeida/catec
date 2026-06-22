import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import CanPermission from "../auth/CanPermission";
import { PermissaoCodigo } from "../auth/permissao";
import { useAuth } from "../auth/AuthContext";
import FieldControl from "../components/form/FieldControl";
import PrimaryButton from "../components/buttons/PrimaryButton";
import DataTableSection from "../components/layout/DataTableSection";
import InlineAlert from "../components/ui/InlineAlert";
import ToastAlert from "../components/ui/ToastAlert";
import {
  DataTable,
  FilterCard,
  FilterField,
  ListPage,
  PageHeader,
  TableAction,
  type DataTableColumn,
} from "../components/list-page";
import { formatDocumentoByTipo, onlyDigits } from "../utils/cpfCnpj";
import { formatTelefoneBrasil } from "../utils/telefoneBrasil";
import type { Cliente, TipoPessoa } from "./clienteTypes";
import "./ClientesPage.css";

function documentoParaExibicao(c: Cliente): string {
  const d = onlyDigits(c.documento ?? "");
  return d ? formatDocumentoByTipo(c.tipoPessoa, d) : "—";
}

export default function ClientesPage() {
  const { logout, hasPermission } = useAuth();
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

  const columns = useMemo<DataTableColumn<Cliente>[]>(
    () => [
      {
        id: "nome",
        header: "Nome / Razão social",
        dataLabel: "Nome / Razão social",
        cellClassName: "data-table__cell-primary",
        render: (c) => c.razaoSocialOuNome,
      },
      {
        id: "documento",
        header: "CPF/CNPJ",
        dataLabel: "CPF/CNPJ",
        render: (c) => documentoParaExibicao(c),
      },
      {
        id: "telefone",
        header: "Telefone",
        dataLabel: "Telefone",
        cellClassName: "data-table__cell-muted",
        render: (c) => (c.telefone ? formatTelefoneBrasil(c.telefone) : "—"),
      },
      {
        id: "email",
        header: "E-mail",
        dataLabel: "E-mail",
        cellClassName: "data-table__cell-muted",
        render: (c) => c.email ?? "-",
      },
    ],
    [],
  );

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
    void carregar();
  }, [carregar]);

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

  return (
    <ListPage>
      <ToastAlert
        open={Boolean(sucesso)}
        variant="success"
        onDismiss={() => setSucesso(null)}
        dismissAriaLabel="Fechar notificação"
        dismissTitle="Fechar"
      >
        {sucesso}
      </ToastAlert>

      <PageHeader
        title="Clientes"
        subtitle="Gestão de clientes."
        actions={
          <CanPermission code={PermissaoCodigo.ACAO_CLIENTE_CRIAR}>
            <PrimaryButton variant="toolbar" onClick={() => navigate("/app/clientes/novo")}>
              Novo cliente
            </PrimaryButton>
          </CanPermission>
        }
      />

      {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

      <FilterCard headingId="clientes-filtros-heading" onClear={limparFiltros}>
        <FilterField id="flt-cliente-nome" label="Nome / Razão social">
          <FieldControl
            id="flt-cliente-nome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="clientes-input"
            variant="compact"
            placeholder="Buscar por nome"
            autoComplete="off"
          />
        </FilterField>
        <FilterField id="flt-cliente-documento" label="CPF/CNPJ">
          <FieldControl
            id="flt-cliente-documento"
            value={filtroDocumento}
            onChange={(e) => setFiltroDocumento(e.target.value)}
            className="clientes-input"
            variant="compact"
            placeholder="Buscar por CPF ou CNPJ"
            autoComplete="off"
          />
        </FilterField>
        <FilterField id="flt-cliente-tipo" label="Tipo">
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
        </FilterField>
      </FilterCard>

      <DataTableSection
        loading={carregando}
        loadingLabel="Carregando lista..."
        useSkeleton
        empty={lista.length === 0}
        emptyMessage="Nenhum cliente cadastrado."
        filterPending={filtrosDigitacaoPendentes}
      >
        <DataTable
          columns={columns}
          rows={listaFiltrada}
          getRowKey={(c) => c.id}
          onRowClick={
            hasPermission(PermissaoCodigo.ACAO_CLIENTE_EDITAR)
              ? (c) => navigate(`/app/clientes/${c.id}/editar`)
              : undefined
          }
          filterEmptyMessage="Não há clientes que correspondam aos filtros."
          tableClassName="data-table--clientes"
          renderActions={
            hasPermission(PermissaoCodigo.ACAO_CLIENTE_EDITAR)
              ? (c) => (
                  <TableAction
                    ariaLabel={`Editar ${c.razaoSocialOuNome}`}
                    onClick={() => navigate(`/app/clientes/${c.id}/editar`)}
                  />
                )
              : undefined
          }
        />
      </DataTableSection>
    </ListPage>
  );
}
