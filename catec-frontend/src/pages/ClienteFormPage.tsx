import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import FieldControl from "../components/form/FieldControl";
import FormField from "../components/form/FormField";
import GhostButton from "../components/buttons/GhostButton";
import PrimaryButton from "../components/buttons/PrimaryButton";
import AdminEntityFormPage from "../components/layout/AdminEntityFormPage";
import ConfirmDialog from "../components/layout/ConfirmDialog";
import ModalFormGrid from "../components/layout/ModalFormGrid";
import {
  AdminEntityFormActions,
  AdminEntityFormAlerts,
  AdminEntityFormHeadline,
  AdminFormDivider,
  AdminFormFields,
  AdminFormGrid3,
  AdminFormSection,
} from "../components/layout/entityFormKit";
import AccessDeniedCard from "../components/ui/AccessDeniedCard";
import InlineAlert from "../components/ui/InlineAlert";
import ToastAlert from "../components/ui/ToastAlert";
import { buscarEnderecoPorCep } from "../api/viaCep";
import { formatCep } from "../utils/cep";
import { onlyDigits } from "../utils/digitsOnly";
import { formatDocumentoByTipo, validateClienteObrigatorios } from "../utils/cpfCnpj";
import { formatTelefoneBrasil } from "../utils/telefoneBrasil";
import type { Cliente, ClienteFormState, TipoPessoa } from "./clienteTypes";
import { EMPTY_CLIENTE_FORM, clienteToFormState } from "./clienteTypes";
import "./ClientesPage.css";

const LIST_PATH = "/app/clientes";

export default function ClienteFormPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const isCreate = idParam === undefined;
  const editandoId = !isCreate && idParam != null ? Number.parseInt(idParam, 10) : null;
  const idInvalido = !isCreate && (editandoId == null || Number.isNaN(editandoId));

  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(!isCreate);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState<ClienteFormState>(EMPTY_CLIENTE_FORM);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [confirmarRemocaoId, setConfirmarRemocaoId] = useState<number | null>(null);
  const [toastObrigatoriedade, setToastObrigatoriedade] = useState<string | null>(null);
  const [cepLookupErro, setCepLookupErro] = useState<string | null>(null);
  const [cepBuscando, setCepBuscando] = useState(false);
  /** Evita nova consulta ao mesmo CEP já aplicado (ex.: vindo do servidor na edição). */
  const ultimoCepPreenchidoRef = useRef<string | null>(null);
  const buscaCepAbortRef = useRef<AbortController | null>(null);

  const carregarCliente = useCallback(async () => {
    if (editandoId == null || Number.isNaN(editandoId)) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/admin/clientes/${editandoId}`);
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 403) {
        setErro("Você não tem permissão para gerenciar clientes.");
        return;
      }
      if (res.status === 404) {
        setErro("Cliente não encontrado.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErro(body?.mensagem ?? `Erro ao carregar cliente (${res.status})`);
        return;
      }
      const c = (await res.json()) as Cliente;
      setForm(clienteToFormState(c));
      const cepCarregado = onlyDigits(c.enderecoCep ?? "");
      ultimoCepPreenchidoRef.current = cepCarregado.length === 8 ? cepCarregado : null;
    } catch {
      setErro("Falha de rede ao carregar cliente.");
    } finally {
      setCarregando(false);
    }
  }, [editandoId, logout, navigate]);

  useEffect(() => {
    if (idInvalido) {
      setCarregando(false);
      setErro("Identificador de cliente inválido.");
      return;
    }
    if (isCreate) {
      setForm(EMPTY_CLIENTE_FORM);
      ultimoCepPreenchidoRef.current = null;
      setCepLookupErro(null);
      setCepBuscando(false);
      setCarregando(false);
      setErro(null);
      return;
    }
    void carregarCliente();
  }, [carregarCliente, idInvalido, isCreate]);

  useEffect(() => {
    if (!toastObrigatoriedade) return;
    const t = window.setTimeout(() => setToastObrigatoriedade(null), 7000);
    return () => window.clearTimeout(t);
  }, [toastObrigatoriedade]);

  useEffect(() => {
    const d = onlyDigits(form.enderecoCep);
    if (d.length !== 8) {
      buscaCepAbortRef.current?.abort();
      buscaCepAbortRef.current = null;
      if (d.length < 8) {
        ultimoCepPreenchidoRef.current = null;
      }
      setCepBuscando(false);
      setCepLookupErro(null);
      return;
    }
    if (d === ultimoCepPreenchidoRef.current) {
      setCepLookupErro(null);
      return;
    }

    const ac = new AbortController();
    buscaCepAbortRef.current?.abort();
    buscaCepAbortRef.current = ac;

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          setCepBuscando(true);
          setCepLookupErro(null);
          const endereco = await buscarEnderecoPorCep(d, ac.signal);
          if (ac.signal.aborted) return;
          if (!endereco) {
            setCepLookupErro("CEP não encontrado.");
            ultimoCepPreenchidoRef.current = null;
            return;
          }
          ultimoCepPreenchidoRef.current = d;
          setForm((f) => ({
            ...f,
            enderecoCep: formatCep(d),
            enderecoLogradouro: endereco.logradouro,
            enderecoCidade: endereco.cidade,
            enderecoUf: endereco.uf,
          }));
        } catch {
          if (ac.signal.aborted) return;
          setCepLookupErro("Não foi possível consultar o CEP. Tente novamente.");
          ultimoCepPreenchidoRef.current = null;
        } finally {
          if (!ac.signal.aborted) {
            setCepBuscando(false);
          }
        }
      })();
    }, 450);

    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [form.enderecoCep]);

  async function salvar() {
    if (idInvalido) return;
    const validacao = validateClienteObrigatorios(form);
    if (validacao) {
      setToastObrigatoriedade(validacao);
      return;
    }
    setSalvando(true);
    setErro(null);
    setToastObrigatoriedade(null);
    try {
      const payload = {
        tipoPessoa: form.tipoPessoa,
        razaoSocialOuNome: form.razaoSocialOuNome.trim(),
        nomeFantasia: form.nomeFantasia.trim() || null,
        documento: onlyDigits(form.documento),
        email: form.email.trim(),
        telefone: onlyDigits(form.telefone),
        enderecoLogradouro: form.enderecoLogradouro.trim() || null,
        enderecoNumero: form.enderecoNumero.trim() || null,
        enderecoComplemento: form.enderecoComplemento.trim() || null,
        enderecoCidade: form.enderecoCidade.trim() || null,
        enderecoUf: form.enderecoUf.trim().toUpperCase() || null,
        enderecoCep: form.enderecoCep.trim() || null,
        observacoes: form.observacoes.trim() || null,
      };
      const path = isCreate ? "/api/v1/admin/clientes" : `/api/v1/admin/clientes/${editandoId}`;
      const method = isCreate ? "POST" : "PUT";
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
      navigate(LIST_PATH, {
        replace: true,
        state: { sucesso: isCreate ? "Cliente criado com sucesso." : "Cliente atualizado com sucesso." },
      });
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
      setConfirmarRemocaoId(null);
      navigate(LIST_PATH, {
        replace: true,
        state: { sucesso: "Cliente removido com sucesso." },
      });
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
            titleId="clientes-form-acesso-negado"
            title="Clientes"
            message="Seu perfil não inclui permissão de administrador técnico para esta tela."
          />
        </div>
      </div>
    );
  }

  const tituloAcao = isCreate ? "Novo cliente" : "Editar cliente";
  const desabilitadoForm = salvando || excluindoId != null || carregando;
  const nomeDestaque =
    !isCreate && editandoId != null && !Number.isNaN(editandoId)
      ? form.razaoSocialOuNome.trim() ||
        form.nomeFantasia.trim() ||
        form.documento.trim() ||
        `Cliente #${editandoId}`
      : null;

  return (
    <>
      <ToastAlert
        open={toastObrigatoriedade != null}
        variant="error"
        onDismiss={() => setToastObrigatoriedade(null)}
        dismissAriaLabel="Fechar notificação"
        dismissTitle="Fechar"
      >
        {toastObrigatoriedade}
      </ToastAlert>

      <AdminEntityFormPage
        listPath={LIST_PATH}
        titleId="cliente-form-titulo"
        title={<AdminEntityFormHeadline action={tituloAcao} entityLabel={nomeDestaque} />}
        footer={
          <AdminEntityFormActions
            danger={
              !isCreate && editandoId != null ? (
                <GhostButton variant="danger" onClick={() => setConfirmarRemocaoId(editandoId)} disabled={desabilitadoForm}>
                  Remover
                </GhostButton>
              ) : undefined
            }
          >
            <GhostButton onClick={() => navigate(LIST_PATH)} disabled={desabilitadoForm}>
              Cancelar
            </GhostButton>
            <PrimaryButton onClick={() => void salvar()} disabled={desabilitadoForm || idInvalido}>
              {salvando ? "Salvando..." : "Salvar"}
            </PrimaryButton>
          </AdminEntityFormActions>
        }
      >
        <AdminEntityFormAlerts>
          {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}
          {carregando ? (
            <p className="admin-entity-form-loading" role="status">
              Carregando dados…
            </p>
          ) : null}
        </AdminEntityFormAlerts>

        {!carregando && !idInvalido ? (
          <>
            <AdminFormSection title="Identificação" titleId="cliente-form-sec-ident">
              <AdminFormFields>
                <ModalFormGrid balanced>
                  <FormField label="Tipo de pessoa" htmlFor="cf-tipo" required>
                    <FieldControl
                      as="select"
                      id="cf-tipo"
                      value={form.tipoPessoa}
                      onChange={(e) => {
                        const tipo = e.target.value as TipoPessoa;
                        setForm((f) => {
                          const d = onlyDigits(f.documento).slice(0, tipo === "PF" ? 11 : 14);
                          return {
                            ...f,
                            tipoPessoa: tipo,
                            documento: d ? formatDocumentoByTipo(tipo, d) : "",
                          };
                        });
                      }}
                      className="clientes-select"
                      variant="modal"
                      disabled={desabilitadoForm}
                      required
                      aria-required="true"
                    >
                      <option value="PF">Pessoa Física</option>
                      <option value="PJ">Pessoa Jurídica</option>
                    </FieldControl>
                  </FormField>
                  <FormField label="CPF/CNPJ" htmlFor="cf-documento" required>
                    <FieldControl
                      id="cf-documento"
                      inputMode="numeric"
                      autoComplete="off"
                      value={form.documento}
                      onChange={(e) => {
                        const max = form.tipoPessoa === "PF" ? 11 : 14;
                        const d = onlyDigits(e.target.value).slice(0, max);
                        setForm((f) => ({
                          ...f,
                          documento: d ? formatDocumentoByTipo(f.tipoPessoa, d) : "",
                        }));
                      }}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm}
                      required
                      aria-required="true"
                      placeholder={form.tipoPessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                    />
                  </FormField>
                </ModalFormGrid>
                <AdminFormDivider />
                <ModalFormGrid balanced>
                  <FormField label="Nome / Razão social" htmlFor="cf-razao" required>
                    <FieldControl
                      id="cf-razao"
                      value={form.razaoSocialOuNome}
                      onChange={(e) => setForm((f) => ({ ...f, razaoSocialOuNome: e.target.value }))}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm}
                      required
                      aria-required="true"
                    />
                  </FormField>
                  <FormField label="Nome fantasia" htmlFor="cf-fantasia">
                    <FieldControl
                      id="cf-fantasia"
                      value={form.nomeFantasia}
                      onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm}
                    />
                  </FormField>
                </ModalFormGrid>
              </AdminFormFields>
            </AdminFormSection>

            <AdminFormSection title="Contato e endereço" titleId="cliente-form-sec-contato">
              <AdminFormFields>
                <ModalFormGrid balanced>
                  <FormField label="E-mail" htmlFor="cf-email" required>
                    <FieldControl
                      id="cf-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm}
                      required
                      aria-required="true"
                    />
                  </FormField>
                  <FormField label="Telefone" htmlFor="cf-telefone" required>
                    <FieldControl
                      id="cf-telefone"
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
                      disabled={desabilitadoForm}
                      required
                      aria-required="true"
                      placeholder="(00) 00000-0000"
                    />
                  </FormField>
                </ModalFormGrid>
                <AdminFormDivider />
                <AdminFormGrid3>
                  <FormField label="CEP" htmlFor="cf-cep" error={cepLookupErro}>
                    <FieldControl
                      id="cf-cep"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={form.enderecoCep}
                      onChange={(e) => {
                        const dig = onlyDigits(e.target.value).slice(0, 8);
                        setForm((f) => ({ ...f, enderecoCep: dig ? formatCep(dig) : "" }));
                      }}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm || cepBuscando}
                      placeholder="00000-000"
                      aria-busy={cepBuscando}
                    />
                  </FormField>
                  <FormField label="Cidade" htmlFor="cf-cidade">
                    <FieldControl
                      id="cf-cidade"
                      value={form.enderecoCidade}
                      onChange={(e) => setForm((f) => ({ ...f, enderecoCidade: e.target.value }))}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm}
                    />
                  </FormField>
                  <FormField label="UF" htmlFor="cf-uf">
                    <FieldControl
                      id="cf-uf"
                      value={form.enderecoUf}
                      onChange={(e) => setForm((f) => ({ ...f, enderecoUf: e.target.value }))}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm}
                      maxLength={2}
                    />
                  </FormField>
                </AdminFormGrid3>
                <ModalFormGrid triple>
                  <FormField label="Logradouro" htmlFor="cf-logradouro">
                    <FieldControl
                      id="cf-logradouro"
                      value={form.enderecoLogradouro}
                      onChange={(e) => setForm((f) => ({ ...f, enderecoLogradouro: e.target.value }))}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm}
                      autoComplete="address-line1"
                    />
                  </FormField>
                  <FormField label="Número" htmlFor="cf-numero">
                    <FieldControl
                      id="cf-numero"
                      inputMode="text"
                      value={form.enderecoNumero}
                      onChange={(e) => setForm((f) => ({ ...f, enderecoNumero: e.target.value }))}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm}
                      maxLength={20}
                      autoComplete="off"
                    />
                  </FormField>
                  <FormField label="Complemento" htmlFor="cf-complemento">
                    <FieldControl
                      id="cf-complemento"
                      value={form.enderecoComplemento}
                      onChange={(e) => setForm((f) => ({ ...f, enderecoComplemento: e.target.value }))}
                      className="clientes-input"
                      variant="modal"
                      disabled={desabilitadoForm}
                      maxLength={120}
                      autoComplete="address-line2"
                    />
                  </FormField>
                </ModalFormGrid>
                <AdminFormDivider />
                <FormField label="Observações" htmlFor="cf-observacoes">
                  <FieldControl
                    as="textarea"
                    id="cf-observacoes"
                    value={form.observacoes}
                    onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                    className="clientes-input clientes-textarea"
                    variant="modal"
                    disabled={desabilitadoForm}
                  />
                </FormField>
              </AdminFormFields>
            </AdminFormSection>
          </>
        ) : null}
      </AdminEntityFormPage>

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
    </>
  );
}
