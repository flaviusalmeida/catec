import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import CanPermission from "../auth/CanPermission";
import { PermissaoCodigo } from "../auth/permissao";
import { useAuth } from "../auth/AuthContext";
import GhostButton from "../components/buttons/GhostButton";
import PrimaryButton from "../components/buttons/PrimaryButton";
import FieldControl from "../components/form/FieldControl";
import FormField from "../components/form/FormField";
import ConfirmDialog from "../components/layout/ConfirmDialog";
import DataTableSection from "../components/layout/DataTableSection";
import FormDialog from "../components/layout/FormDialog";
import ModalFooter from "../components/layout/ModalFooter";
import ModalFormGrid from "../components/layout/ModalFormGrid";
import ModalSection from "../components/layout/ModalSection";
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
import LabeledSwitch from "../components/ui/LabeledSwitch";
import ToastAlert from "../components/ui/ToastAlert";
import "../styles/admin-crud-table.css";
import "./GruposPage.css";

type Grupo = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  sistema: boolean;
  permissoes: string[];
  criadoEm: string;
  atualizadoEm: string;
};

type PermissaoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  tipo: "TELA" | "ACAO";
  modulo: string;
  descricao: string | null;
};

type FormState = {
  nome: string;
  descricao: string;
  ativo: boolean;
  permissoes: Set<string>;
};

function emptyForm(): FormState {
  return {
    nome: "",
    descricao: "",
    ativo: true,
    permissoes: new Set(),
  };
}

function formFromGrupo(g: Grupo): FormState {
  return {
    nome: g.nome,
    descricao: g.descricao ?? "",
    ativo: g.ativo,
    permissoes: new Set(g.permissoes),
  };
}

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

function agruparPermissoesPorModulo(catalogo: PermissaoCatalogo[]): Map<string, PermissaoCatalogo[]> {
  const map = new Map<string, PermissaoCatalogo[]>();
  for (const p of catalogo) {
    const list = map.get(p.modulo) ?? [];
    list.push(p);
    map.set(p.modulo, list);
  }
  return map;
}

export default function GruposPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [lista, setLista] = useState<Grupo[]>([]);
  const [catalogo, setCatalogo] = useState<PermissaoCatalogo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"" | "sistema" | "custom">("");
  const [filtroStatus, setFiltroStatus] = useState<"" | "ativo" | "inativo">("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modo, setModo] = useState<"criar" | "editar">("criar");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoSistema, setEditandoSistema] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExcluirAberto, setConfirmarExcluirAberto] = useState(false);

  const deferredNome = useDeferredValue(filtroNome);
  const filtrosDigitacaoPendentes = filtroNome !== deferredNome;

  const listaFiltrada = useMemo(
    () => filtrarGrupos(lista, deferredNome, filtroTipo, filtroStatus),
    [lista, deferredNome, filtroTipo, filtroStatus],
  );

  const permissoesPorModulo = useMemo(() => agruparPermissoesPorModulo(catalogo), [catalogo]);

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
      const [resGrupos, resCatalogo] = await Promise.all([
        apiFetch("/api/v1/admin/grupos"),
        apiFetch("/api/v1/admin/grupos/permissoes"),
      ]);
      if (resGrupos.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (resGrupos.status === 403) {
        setErro("Você não tem permissão para gerenciar grupos de acesso.");
        setLista([]);
        return;
      }
      if (!resGrupos.ok) {
        const body = await resGrupos.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ${resGrupos.status}`);
        return;
      }
      if (resCatalogo.ok) {
        setCatalogo((await resCatalogo.json()) as PermissaoCatalogo[]);
      }
      setLista((await resGrupos.json()) as Grupo[]);
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

  function abrirCriar() {
    setErro(null);
    setSucesso(null);
    setModo("criar");
    setEditandoId(null);
    setEditandoSistema(false);
    setConfirmarExcluirAberto(false);
    setForm(emptyForm());
    setModalAberto(true);
  }

  function abrirEditar(g: Grupo) {
    setErro(null);
    setSucesso(null);
    setModo("editar");
    setEditandoId(g.id);
    setEditandoSistema(g.sistema);
    setConfirmarExcluirAberto(false);
    setForm(formFromGrupo(g));
    setModalAberto(true);
  }

  function togglePermissao(codigo: string) {
    setForm((f) => {
      const next = new Set(f.permissoes);
      if (next.has(codigo)) {
        next.delete(codigo);
      } else {
        next.add(codigo);
      }
      return { ...f, permissoes: next };
    });
  }

  async function salvar() {
    if (form.permissoes.size === 0) {
      setErro("Selecione pelo menos uma permissão.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const permissoes = [...form.permissoes];
      if (modo === "criar") {
        const res = await apiFetch("/api/v1/admin/grupos", {
          method: "POST",
          body: JSON.stringify({
            nome: form.nome.trim(),
            descricao: form.descricao.trim() || null,
            permissoes,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setErro(body?.mensagem ?? `Erro ao criar (${res.status})`);
          return;
        }
        setSucesso("Grupo criado com sucesso.");
      } else if (editandoId != null) {
        const res = await apiFetch(`/api/v1/admin/grupos/${editandoId}`, {
          method: "PUT",
          body: JSON.stringify({
            nome: form.nome.trim(),
            descricao: form.descricao.trim() || null,
            ativo: form.ativo,
            permissoes,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setErro(body?.mensagem ?? `Erro ao atualizar (${res.status})`);
          return;
        }
        setSucesso("Grupo atualizado com sucesso.");
      }
      setModalAberto(false);
      await carregar();
    } catch {
      setErro("Falha de rede ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirGrupo() {
    if (editandoId == null || editandoSistema) return;
    setExcluindo(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/admin/grupos/${editandoId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ao excluir (${res.status})`);
        return;
      }
      setSucesso("Grupo excluído.");
      setModalAberto(false);
      setConfirmarExcluirAberto(false);
      await carregar();
    } catch {
      setErro("Falha de rede ao excluir.");
    } finally {
      setExcluindo(false);
    }
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

      {erro && !modalAberto ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

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
          onRowClick={abrirEditar}
          filterEmptyMessage="Não há grupos que correspondam aos filtros."
          tableClassName="data-table--grupos"
          renderActions={(g) => (
            <CanPermission code={PermissaoCodigo.ACAO_GRUPO_GERIR}>
              <TableAction ariaLabel={`Editar ${g.nome}`} onClick={() => abrirEditar(g)} />
            </CanPermission>
          )}
        />
      </DataTableSection>

      <FormDialog
        open={modalAberto}
        titleId="grupos-modal-titulo"
        title={modo === "criar" ? "Novo grupo" : "Editar grupo"}
        onBackdropClick={() => {
          if (salvando || excluindo) return;
          setModalAberto(false);
          setConfirmarExcluirAberto(false);
        }}
      >
        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}

        <ModalSection title="Identificação" titleId="grupo-modal-sec-id">
          <ModalFormGrid balanced>
            <FormField label="Nome" htmlFor="gf-nome">
              <FieldControl
                id="gf-nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                variant="modal"
                disabled={salvando}
              />
            </FormField>
            {modo === "editar" ? (
              <FormField label="Status" htmlFor="gf-ativo">
                <LabeledSwitch
                  id="gf-ativo"
                  label="Grupo ativo"
                  checked={form.ativo}
                  onChange={(checked) => setForm((f) => ({ ...f, ativo: checked }))}
                  disabled={salvando}
                />
              </FormField>
            ) : null}
          </ModalFormGrid>
          <FormField label="Descrição" htmlFor="gf-desc">
            <FieldControl
              id="gf-desc"
              as="textarea"
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              variant="modal"
              disabled={salvando}
              rows={2}
            />
          </FormField>
          {modo === "editar" && editandoSistema ? (
            <p className="grupos-permissoes-count">Grupo padrão do sistema — não pode ser excluído.</p>
          ) : null}
        </ModalSection>

        <ModalSection title="Permissões" titleId="grupo-modal-sec-perm">
          <div className="grupos-permissoes-modal">
            {[...permissoesPorModulo.entries()].map(([modulo, permissoes]) => (
              <div key={modulo} className="grupos-permissoes-modulo">
                <h4 className="grupos-permissoes-modulo-title">{modulo}</h4>
                <div className="grupos-permissoes-list">
                  {permissoes.map((p) => (
                    <div key={p.codigo} className="grupos-permissao-option">
                      <label className="grupos-permissao-option-main" htmlFor={`gf-perm-${p.codigo}`}>
                        <input
                          id={`gf-perm-${p.codigo}`}
                          type="checkbox"
                          className="grupos-permissao-option-input"
                          checked={form.permissoes.has(p.codigo)}
                          onChange={() => togglePermissao(p.codigo)}
                          disabled={salvando}
                        />
                        <span className="grupos-permissao-option-text">
                          <span className="grupos-permissao-option-title">{p.nome}</span>
                          {p.descricao ? (
                            <span className="grupos-permissao-option-desc">{p.descricao}</span>
                          ) : null}
                        </span>
                      </label>
                      <span
                        className={`grupos-permissao-tipo grupos-permissao-tipo--${p.tipo === "TELA" ? "tela" : "acao"}`}
                      >
                        {p.tipo === "TELA" ? "Tela" : "Ação"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ModalSection>

        {modo === "editar" && !editandoSistema ? (
          <CanPermission code={PermissaoCodigo.ACAO_GRUPO_GERIR}>
            <button
              type="button"
              className="grupos-modal-excluir"
              onClick={() => setConfirmarExcluirAberto(true)}
              disabled={salvando || excluindo}
            >
              Excluir grupo
            </button>
          </CanPermission>
        ) : null}

        <ModalFooter>
          <GhostButton
            onClick={() => {
              setModalAberto(false);
              setConfirmarExcluirAberto(false);
            }}
            disabled={salvando || excluindo}
          >
            Cancelar
          </GhostButton>
          <CanPermission code={PermissaoCodigo.ACAO_GRUPO_GERIR}>
            <PrimaryButton onClick={() => void salvar()} disabled={salvando || excluindo}>
              {salvando ? "Salvando…" : "Salvar"}
            </PrimaryButton>
          </CanPermission>
        </ModalFooter>
      </FormDialog>

      <ConfirmDialog
        open={confirmarExcluirAberto}
        titleId="grupos-confirm-excluir-titulo"
        title="Confirmar exclusão"
        description="O grupo será removido permanentemente. Usuários que o possuíam perderão as permissões associadas. Continuar?"
        onBackdropClick={() => !excluindo && setConfirmarExcluirAberto(false)}
        actions={
          <>
            <GhostButton onClick={() => setConfirmarExcluirAberto(false)} disabled={excluindo}>
              Cancelar
            </GhostButton>
            <PrimaryButton variant="danger" onClick={() => void excluirGrupo()} disabled={excluindo}>
              {excluindo ? "Excluindo…" : "Excluir"}
            </PrimaryButton>
          </>
        }
      />
    </ListPage>
  );
}
