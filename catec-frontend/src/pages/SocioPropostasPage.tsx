import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import GhostButton from "../components/buttons/GhostButton";
import PrimaryButton from "../components/buttons/PrimaryButton";
import FieldControl from "../components/form/FieldControl";
import FormField from "../components/form/FormField";
import DataTableSection from "../components/layout/DataTableSection";
import FormDialog from "../components/layout/FormDialog";
import ModalFooter from "../components/layout/ModalFooter";
import PageToolbar from "../components/layout/PageToolbar";
import InlineAlert from "../components/ui/InlineAlert";
import ToastAlert from "../components/ui/ToastAlert";
import { mensagemErroApi } from "../utils/apiError";
import type { PropostaPendenteSocio } from "./propostaTypes";
import "./ClientesPage.css";
import "./SocioPropostasPage.css";
import "../styles/admin-crud-table.css";

type AcaoModal = "devolver" | null;

export default function SocioPropostasPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [lista, setLista] = useState<PropostaPendenteSocio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [acaoModal, setAcaoModal] = useState<AcaoModal>(null);
  const [itemAcao, setItemAcao] = useState<PropostaPendenteSocio | null>(null);
  const [parecer, setParecer] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiFetch("/api/v1/socio/propostas/pendentes");
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) {
        setErro(await mensagemErroApi(res, "Erro ao carregar fila"));
        setLista([]);
        return;
      }
      setLista((await res.json()) as PropostaPendenteSocio[]);
    } catch {
      setErro("Falha de rede.");
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
    const t = window.setTimeout(() => setSucesso(null), 5000);
    return () => window.clearTimeout(t);
  }, [sucesso]);

  async function aprovar(p: PropostaPendenteSocio) {
    setProcessando(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/socio/propostas/${p.propostaId}/aprovar`, {
        method: "POST",
        body: JSON.stringify({ projetoId: p.projetoId, observacao: null }),
      });
      if (!res.ok) {
        setErro(await mensagemErroApi(res, "Erro ao aprovar"));
        return;
      }
      setSucesso("Proposta aprovada. O administrativo pode enviá-la ao cliente.");
      await carregar();
    } catch {
      setErro("Falha de rede ao aprovar.");
    } finally {
      setProcessando(false);
    }
  }

  async function confirmarDevolucao() {
    if (!itemAcao || !parecer.trim()) return;
    setProcessando(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/v1/socio/propostas/${itemAcao.propostaId}/devolver`, {
        method: "POST",
        body: JSON.stringify({ projetoId: itemAcao.projetoId, observacao: parecer.trim() }),
      });
      if (!res.ok) {
        setErro(await mensagemErroApi(res, "Erro ao devolver"));
        return;
      }
      setSucesso("Proposta devolvida para rascunho.");
      setAcaoModal(null);
      setItemAcao(null);
      setParecer("");
      await carregar();
    } catch {
      setErro("Falha de rede ao devolver.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="clientes-page">
      <ToastAlert
        open={Boolean(sucesso)}
        variant="success"
        onDismiss={() => setSucesso(null)}
        dismissAriaLabel="Fechar"
        dismissTitle="Fechar"
      >
        {sucesso}
      </ToastAlert>

      <div className="clientes-page-inner clientes-page-stack">
        <PageToolbar
          title="Propostas pendentes"
          subtitle="Avaliação interna antes do envio ao cliente."
        />
        {erro ? <InlineAlert variant="error">{erro}</InlineAlert> : null}
        <DataTableSection
          loading={carregando}
          loadingLabel="Carregando fila…"
          empty={lista.length === 0}
          emptyMessage="Nenhuma proposta pendente encontrada."
        >
          <table className="admin-crud-table socio-fila-table">
            <thead>
              <tr>
                <th scope="col">Projeto</th>
                <th scope="col">Cliente</th>
                <th scope="col">Versão</th>
                <th scope="col">Elaborada por</th>
                <th scope="col" className="admin-crud-table__th-actions">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p, idx) => (
                <tr
                  key={p.propostaId}
                  className={`admin-crud-table__row${idx % 2 === 1 ? " admin-crud-table__row--alt" : ""}`}
                >
                  <td data-label="Projeto">{p.projetoTitulo}</td>
                  <td data-label="Cliente">{p.clienteNome ?? "—"}</td>
                  <td data-label="Versão">v{p.versao}</td>
                  <td data-label="Elaborada por">{p.elaboradoPorNome}</td>
                  <td className="admin-crud-table__td-actions socio-fila-acoes" data-label="Ações">
                    <PrimaryButton
                      variant="toolbar"
                      disabled={processando}
                      onClick={() => void aprovar(p)}
                    >
                      Aprovar
                    </PrimaryButton>
                    <GhostButton
                      disabled={processando}
                      onClick={() => {
                        setItemAcao(p);
                        setParecer("");
                        setAcaoModal("devolver");
                      }}
                    >
                      Devolver
                    </GhostButton>
                    <Link to={`/app/projetos/${p.projetoId}`} className="socio-fila-link-detalhe">
                      Detalhe
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableSection>
      </div>

      <FormDialog
        open={acaoModal === "devolver" && itemAcao != null}
        titleId="socio-devolver-titulo"
        title="Devolver para rascunho"
        onBackdropClick={() => {
          if (processando) return;
          setAcaoModal(null);
        }}
      >
        <p className="socio-fila-modal-hint">
          Informe o parecer para o administrativo ajustar a proposta de <strong>{itemAcao?.projetoTitulo}</strong>.
        </p>
        <FormField label="Parecer" htmlFor="socio-parecer" required>
          <FieldControl
            as="textarea"
            id="socio-parecer"
            className="clientes-input clientes-textarea"
            value={parecer}
            onChange={(e) => setParecer(e.target.value)}
            disabled={processando}
            rows={5}
            required
          />
        </FormField>
        <ModalFooter>
          <GhostButton disabled={processando} onClick={() => setAcaoModal(null)}>
            Cancelar
          </GhostButton>
          <PrimaryButton disabled={processando || !parecer.trim()} onClick={() => void confirmarDevolucao()}>
            {processando ? "Salvando…" : "Confirmar devolução"}
          </PrimaryButton>
        </ModalFooter>
      </FormDialog>
    </div>
  );
}
