import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import CanPermission from "../auth/CanPermission";
import { PermissaoCodigo } from "../auth/permissao";
import { useAuth } from "../auth/AuthContext";
import PrimaryButton from "../components/buttons/PrimaryButton";
import FieldControl from "../components/form/FieldControl";
import DataTableSection from "../components/layout/DataTableSection";
import {
  DataTable,
  FilterCard,
  FilterField,
  ListPage,
  PageHeader,
  TableAction,
  type DataTableColumn,
} from "../components/list-page";
import InlineAlert from "../components/ui/InlineAlert";
import ToastAlert from "../components/ui/ToastAlert";
import type { Grupo } from "./grupoTypes";
import "../styles/admin-crud-table.css";
import "./GruposPage.css";

const LIST_PATH = "/app/grupos";

function filtrarGrupos(
  lista: Grupo[],
  nome: string,
  tipo: "" | "sistema" | "custom",
  status: "" | "ativo" | "inativo",
): Grupo[] {
  const n = nome.trim().toLowerCase();
  return lista.filter((g) => {
    if (n && !g.nome.toLowerCase().includes(n) && !g.codigo.toLowerCase().includes(n)) return false;
    if (tipo === "sistema" && !g.sistema) return false;
    if (tipo === "custom" && g.sistema) return false;
    if (status === "ativo" && !g.ativo) return false;
    if (status === "inativo" && g.ativo) return false;
    return true;
  });
}

export default function GruposPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lista, setLista] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(
    (location.state as { sucesso?: string } | null)?.sucesso ?? null,
  );
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"" | "sistema" | "custom">("");
  const [filtroStatus, setFiltroStatus] = useState<"" | "ativo" | "inativo">("");

  const deferredNome = useDeferredValue(filtroNome);
  const filtrosDigitacaoPendentes = filtroNome !== deferredNome;

  const listaFiltrada = useMemo(
    () => filtrarGrupos(lista, deferredNome, filtroTipo, filtroStatus),
    [lista, deferredNome, filtroTipo, filtroStatus],
  );

  const columns = useMemo<DataTableColumn<Grupo>[]>(
    () => [
      {
        id: "nome",
        header: "Nome",
        dataLabel: "Nome",
        cellClassName: "data-table__cell-primary",
        render: (g) => g.nome,
      },
      {
        id: "codigo",
        header: "Código",
        dataLabel: "Código",
        cellClassName: "grupos-codigo",
        render: (g) => g.codigo,
      },
      {
        id: "tipo",
        header: "Tipo",
        dataLabel: "Tipo",
        render: (g) =>
          g.sistema ? (
            <span className="grupos-badge-sistema">Sistema</span>
          ) : (
            <span className="grupos-badge-custom">Customizado</span>
          ),
      },
      {
        id: "permissoes",
        header: "Permissões",
        dataLabel: "Permissões",
        cellClassName: "grupos-permissoes-count",
        render: (g) => `${g.permissoes.length}`,
      },
      {
        id: "status",
        header: "Status",
        dataLabel: "Status",
        render: (g) => (g.ativo ? "Ativo" : "Inativo"),
      },
    ],
    [],
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
      const res = await apiFetch("/api/v1/admin/grupos");
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        setErro("Você não tem permissão para gerenciar grupos de acesso.");
        setLista([]);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ${res.status}`);
        return;
      }
      setLista((await res.json()) as Grupo[]);
    } catch {
      setErro("Não foi possível carregar os grupos.");
    } finally {
      setCarregando(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function limparFiltros() {
    setFiltroNome("");
    setFiltroTipo("");
    setFiltroStatus("");
  }

  function abrirGrupo(g: Grupo) {
    navigate(`${LIST_PATH}/${g.id}`);
  }

  function abrirCriar() {
    navigate(`${LIST_PATH}/novo`);
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
        title="Grupos de acesso"
        subtitle="Perfis de permissão atribuídos aos usuários."
        actions={
          <CanPermission code={PermissaoCodigo.ACAO_GRUPO_GERIR}>
            <PrimaryButton variant="toolbar" onClick={abrirCriar}>
              Novo grupo
            </PrimaryButton>
          </CanPermission>
        }
      />

      {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

      <FilterCard headingId="grupos-filtros-heading" onClear={limparFiltros}>
        <FilterField id="flt-grupo-nome" label="Nome ou código">
          <FieldControl
            id="flt-grupo-nome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            variant="compact"
            placeholder="Buscar grupo"
            autoComplete="off"
          />
        </FilterField>
        <FilterField id="flt-grupo-tipo" label="Tipo">
          <FieldControl
            as="select"
            id="flt-grupo-tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as "" | "sistema" | "custom")}
            variant="compact"
          >
            <option value="">Todos</option>
            <option value="sistema">Sistema</option>
            <option value="custom">Customizado</option>
          </FieldControl>
        </FilterField>
        <FilterField id="flt-grupo-status" label="Status">
          <FieldControl
            as="select"
            id="flt-grupo-status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as "" | "ativo" | "inativo")}
            variant="compact"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </FieldControl>
        </FilterField>
      </FilterCard>

      <DataTableSection
        loading={carregando}
        loadingLabel="Carregando lista…"
        useSkeleton
        empty={lista.length === 0}
        emptyMessage="Nenhum grupo cadastrado."
        filterPending={filtrosDigitacaoPendentes}
      >
        <DataTable
          columns={columns}
          rows={listaFiltrada}
          getRowKey={(g) => g.id}
          onRowClick={abrirGrupo}
          filterEmptyMessage="Não há grupos que correspondam aos filtros."
          tableClassName="data-table--grupos"
          renderActions={(g) => (
            <CanPermission code={PermissaoCodigo.ACAO_GRUPO_GERIR}>
              <TableAction ariaLabel={`Editar ${g.nome}`} onClick={() => abrirGrupo(g)} />
            </CanPermission>
          )}
        />
      </DataTableSection>
    </ListPage>
  );
}
