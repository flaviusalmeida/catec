import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/http";
import CanPermission from "../auth/CanPermission";
import { PermissaoCodigo } from "../auth/permissao";
import { useAuth } from "../auth/AuthContext";
import GrupoPermissoesPanel from "../components/grupo/GrupoPermissoesPanel";
import GhostButton from "../components/buttons/GhostButton";
import PrimaryButton from "../components/buttons/PrimaryButton";
import FieldControl from "../components/form/FieldControl";
import FormField from "../components/form/FormField";
import ConfirmDialog from "../components/layout/ConfirmDialog";
import { DashboardCard } from "../components/projeto/detalhe/detalheUi";
import InlineAlert from "../components/ui/InlineAlert";
import LabeledSwitch from "../components/ui/LabeledSwitch";
import StatusBadge, { StatusBadgeGroup } from "../components/ui/StatusBadge";
import ToastAlert from "../components/ui/ToastAlert";
import "../components/projeto/detalhe/ProjetoDetalhe.css";
import "./GruposPage.css";
import {
  emptyGrupoForm,
  grupoToForm,
  type Grupo,
  type GrupoFormState,
  type PermissaoCatalogo,
} from "./grupoTypes";
import "./GrupoFormPage.css";

const LIST_PATH = "/app/grupos";

type TabId = "geral" | "permissoes";

const TABS: { id: TabId; label: string }[] = [
  { id: "geral", label: "Geral" },
  { id: "permissoes", label: "Permissões" },
];

export default function GrupoFormPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const isCreate = idParam === "novo" || idParam == null;
  const editandoId = !isCreate && idParam != null ? Number.parseInt(idParam, 10) : null;
  const idInvalido = !isCreate && (editandoId == null || Number.isNaN(editandoId));

  const { logout } = useAuth();
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [catalogo, setCatalogo] = useState<PermissaoCatalogo[]>([]);
  const [form, setForm] = useState<GrupoFormState>(() => emptyGrupoForm());
  const [tab, setTab] = useState<TabId>("geral");
  const [filtroPermissoes, setFiltroPermissoes] = useState("");
  const [carregando, setCarregando] = useState(!isCreate);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExcluirAberto, setConfirmarExcluirAberto] = useState(false);

  const totalCatalogo = catalogo.length;

  const carregar = useCallback(async () => {
    if (idInvalido) {
      setErro("Grupo inválido.");
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);
    try {
      const reqs = [apiFetch("/api/v1/admin/grupos/permissoes")];
      if (!isCreate && editandoId != null) {
        reqs.push(apiFetch(`/api/v1/admin/grupos/${editandoId}`));
      }

      const results = await Promise.all(reqs);
      const resCatalogo = results[0];

      if (resCatalogo.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (resCatalogo.status === 403) {
        setErro("Você não tem permissão para gerenciar grupos de acesso.");
        return;
      }
      if (resCatalogo.ok) {
        setCatalogo((await resCatalogo.json()) as PermissaoCatalogo[]);
      }

      if (!isCreate && editandoId != null) {
        const resGrupo = results[1];
        if (resGrupo.status === 404) {
          setErro("Grupo não encontrado.");
          return;
        }
        if (!resGrupo.ok) {
          const body = await resGrupo.json().catch(() => null);
          setErro(body?.mensagem ?? `Erro ao carregar grupo (${resGrupo.status})`);
          return;
        }
        const g = (await resGrupo.json()) as Grupo;
        setGrupo(g);
        setForm(grupoToForm(g));
      } else {
        setGrupo(null);
        setForm(emptyGrupoForm());
      }
    } catch {
      setErro("Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }, [editandoId, idInvalido, isCreate, logout, navigate]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!sucesso) return;
    const t = window.setTimeout(() => setSucesso(null), 6000);
    return () => window.clearTimeout(t);
  }, [sucesso]);

  const titulo = useMemo(() => {
    if (isCreate) return "Novo grupo";
    if (carregando) return "…";
    return form.nome.trim() || grupo?.nome || "Grupo";
  }, [carregando, form.nome, grupo?.nome, isCreate]);

  function togglePermissao(codigo: string) {
    setForm((f) => {
      const next = new Set(f.permissoes);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return { ...f, permissoes: next };
    });
  }

  function toggleModulo(codigos: string[], marcar: boolean) {
    setForm((f) => {
      const next = new Set(f.permissoes);
      for (const codigo of codigos) {
        if (marcar) next.add(codigo);
        else next.delete(codigo);
      }
      return { ...f, permissoes: next };
    });
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErro("Informe o nome do grupo.");
      setTab("geral");
      return;
    }
    if (form.permissoes.size === 0) {
      setErro("Selecione pelo menos uma permissão.");
      setTab("permissoes");
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const permissoes = [...form.permissoes];
      if (isCreate) {
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
        const criado = (await res.json()) as Grupo;
        setSucesso("Grupo criado com sucesso.");
        navigate(`${LIST_PATH}/${criado.id}`, { replace: true });
        return;
      }

      if (editandoId == null) return;
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
      const atualizado = (await res.json()) as Grupo;
      setGrupo(atualizado);
      setForm(grupoToForm(atualizado));
      setSucesso("Grupo atualizado com sucesso.");
    } catch {
      setErro("Falha de rede ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirGrupo() {
    if (editandoId == null || grupo?.sistema) return;
    setExcluindo(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/admin/grupos/${editandoId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ao excluir (${res.status})`);
        return;
      }
      navigate(LIST_PATH, { replace: true, state: { sucesso: "Grupo excluído." } });
    } catch {
      setErro("Falha de rede ao excluir.");
    } finally {
      setExcluindo(false);
      setConfirmarExcluirAberto(false);
    }
  }

  return (
    <div className="proj-detalhe-page">
      <div className="proj-detalhe-page__inner">
        <Link className="proj-detalhe-back" to={LIST_PATH}>
          ← Voltar para grupos
        </Link>

        <ToastAlert
          open={Boolean(sucesso)}
          variant="success"
          onDismiss={() => setSucesso(null)}
          dismissAriaLabel="Fechar notificação"
          dismissTitle="Fechar"
        >
          {sucesso}
        </ToastAlert>

        {erro ? (
          <div className="grupo-form-alerts">
            <InlineAlert variant="error">{erro}</InlineAlert>
          </div>
        ) : null}

        {carregando ? (
          <p className="proj-detalhe-loading" role="status">
            Carregando dados…
          </p>
        ) : null}

        {!carregando && !idInvalido ? (
          <>
            <header className="proj-detalhe-header">
              <div className="proj-detalhe-header__left">
                <h1 id="grupo-form-titulo" className="proj-detalhe-header__title">
                  {titulo}
                </h1>
                <p className="proj-detalhe-header__subtitle">
                  {!isCreate && grupo ? (
                    <>
                      <span className="proj-detalhe-header__cliente">{grupo.codigo}</span>
                      <span className="proj-detalhe-header__sep" aria-hidden>
                        •
                      </span>
                      <StatusBadgeGroup>
                        <span className={grupo.sistema ? "grupos-badge-sistema" : "grupos-badge-custom"}>
                          {grupo.sistema ? "Sistema" : "Customizado"}
                        </span>
                        <StatusBadge variant={form.ativo ? "ativo" : "inativo"}>
                          {form.ativo ? "Ativo" : "Inativo"}
                        </StatusBadge>
                      </StatusBadgeGroup>
                    </>
                  ) : (
                    <span>Cadastro de grupo de acesso</span>
                  )}
                </p>
              </div>
              <div className="proj-detalhe-header__actions">
                <GhostButton onClick={() => navigate(LIST_PATH)} disabled={salvando || excluindo}>
                  Cancelar
                </GhostButton>
                <CanPermission code={PermissaoCodigo.ACAO_GRUPO_GERIR}>
                  <PrimaryButton onClick={() => void salvar()} disabled={salvando || excluindo}>
                    {salvando ? "Salvando…" : "Salvar"}
                  </PrimaryButton>
                </CanPermission>
              </div>
            </header>

            <div className="proj-detalhe-layout">
              <div className="proj-detalhe-main">
                <div className="proj-detalhe-tabs-shell">
                  <nav className="proj-detalhe-tabs" aria-label="Seções do grupo">
                    {TABS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={
                          tab === t.id
                            ? "proj-detalhe-tabs__btn proj-detalhe-tabs__btn--active"
                            : "proj-detalhe-tabs__btn"
                        }
                        aria-selected={tab === t.id}
                        onClick={() => setTab(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </nav>

                  <div className="proj-detalhe-tab-panel">
                    {tab === "geral" ? (
                      <DashboardCard title="Identificação" titleId="grupo-tab-geral">
                        <div className="grupo-form-fields">
                          <FormField label="Nome" htmlFor="gf-nome">
                            <FieldControl
                              id="gf-nome"
                              value={form.nome}
                              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                              variant="modal"
                              disabled={salvando}
                            />
                          </FormField>
                          {!isCreate && grupo ? (
                            <FormField label="Código" htmlFor="gf-codigo">
                              <FieldControl
                                id="gf-codigo"
                                value={grupo.codigo}
                                variant="modal"
                                disabled
                              />
                            </FormField>
                          ) : null}
                          <FormField label="Descrição" htmlFor="gf-desc">
                            <FieldControl
                              id="gf-desc"
                              as="textarea"
                              value={form.descricao}
                              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                              variant="modal"
                              disabled={salvando}
                              rows={4}
                            />
                          </FormField>
                          {!isCreate ? (
                            <LabeledSwitch
                              id="gf-ativo"
                              label="Grupo ativo"
                              checked={form.ativo}
                              onChange={(checked) => setForm((f) => ({ ...f, ativo: checked }))}
                              disabled={salvando}
                            />
                          ) : null}
                          {grupo?.sistema ? (
                            <p className="grupo-form-hint">
                              Grupo padrão do sistema — não pode ser excluído.
                            </p>
                          ) : null}
                          {!isCreate && grupo && !grupo.sistema ? (
                            <CanPermission code={PermissaoCodigo.ACAO_GRUPO_GERIR}>
                              <button
                                type="button"
                                className="grupo-form-btn-excluir"
                                onClick={() => setConfirmarExcluirAberto(true)}
                                disabled={salvando || excluindo}
                              >
                                Excluir grupo
                              </button>
                            </CanPermission>
                          ) : null}
                        </div>
                      </DashboardCard>
                    ) : null}

                    {tab === "permissoes" ? (
                      <>
                        <div className="grupo-form-toolbar">
                          <div className="grupo-form-toolbar__search">
                            <FieldControl
                              id="gf-filtro-perm"
                              value={filtroPermissoes}
                              onChange={(e) => setFiltroPermissoes(e.target.value)}
                              variant="compact"
                              placeholder="Buscar permissão…"
                              autoComplete="off"
                            />
                          </div>
                          <span className="grupo-form-toolbar__count">
                            {form.permissoes.size} de {totalCatalogo} permissões selecionadas
                          </span>
                        </div>
                        <GrupoPermissoesPanel
                          catalogo={catalogo}
                          form={form}
                          filtro={filtroPermissoes}
                          disabled={salvando}
                          onToggle={togglePermissao}
                          onToggleModulo={toggleModulo}
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <aside className="proj-detalhe-sidebar">
                <div className="proj-detalhe-sidebar__sticky">
                  <DashboardCard title="Resumo" titleId="grupo-resumo" variant="sidebar">
                    <ul className="proj-detalhe-resumo-list">
                      <li>
                        <span className="proj-detalhe-resumo-list__label">Permissões</span>
                        <span className="proj-detalhe-resumo-list__value">
                          {form.permissoes.size} / {totalCatalogo}
                        </span>
                      </li>
                      {!isCreate && grupo ? (
                        <>
                          <li>
                            <span className="proj-detalhe-resumo-list__label">Código</span>
                            <span className="proj-detalhe-resumo-list__value">{grupo.codigo}</span>
                          </li>
                          <li>
                            <span className="proj-detalhe-resumo-list__label">Tipo</span>
                            <span className="proj-detalhe-resumo-list__value">
                              <span className={grupo.sistema ? "grupos-badge-sistema" : "grupos-badge-custom"}>
                                {grupo.sistema ? "Sistema" : "Customizado"}
                              </span>
                            </span>
                          </li>
                        </>
                      ) : null}
                    </ul>
                  </DashboardCard>
                </div>
              </aside>
            </div>
          </>
        ) : null}
      </div>

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
    </div>
  );
}
