import { useCallback, useEffect, useId, useRef, useState } from "react";
import { apiFetch } from "../../api/http";
import type { ClienteResumo } from "../../pages/projetoTypes";
import FieldControl from "../form/FieldControl";
import FormField from "../form/FormField";
import "./ClienteAutocomplete.css";

const DEBOUNCE_MS = 280;

export type ClienteAutocompleteProps = {
  /** Rótulo visível (FormField). */
  label: string;
  disabled?: boolean;
  required?: boolean;
  /** Id do cliente selecionado (string vazia = nenhum). */
  valueId: string;
  /** Texto do campo de busca / nome exibido. */
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onSelect: (cliente: ClienteResumo) => void;
  clearable?: boolean;
  onClear?: () => void;
  /** Erro de rede / API (opcional). */
  fetchError?: string | null;
  onFetchError?: (msg: string | null) => void;
};

/**
 * Autocomplete de clientes com consulta a `GET /api/v1/clientes-resumo?q=`.
 */
export default function ClienteAutocomplete({
  label,
  disabled,
  required,
  valueId,
  inputValue,
  onInputValueChange,
  onSelect,
  clearable,
  onClear,
  fetchError,
  onFetchError,
}: ClienteAutocompleteProps) {
  const baseId = useId();
  const listId = `${baseId}-lista`;
  const inputId = `${baseId}-input`;
  const [opcoes, setOpcoes] = useState<ClienteResumo[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const buscar = useCallback(
    async (q: string) => {
      setCarregando(true);
      onFetchError?.(null);
      try {
        const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
        const res = await apiFetch(`/api/v1/clientes-resumo${qs}`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          onFetchError?.(body?.mensagem ?? `Erro ao pesquisar clientes (${res.status})`);
          setOpcoes([]);
          return;
        }
        setOpcoes((await res.json()) as ClienteResumo[]);
      } catch {
        onFetchError?.("Falha de rede ao pesquisar clientes.");
        setOpcoes([]);
      } finally {
        setCarregando(false);
      }
    },
    [onFetchError],
  );

  useEffect(() => {
    if (disabled) return;
    const t = window.setTimeout(() => {
      void buscar(inputValue);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [buscar, disabled, inputValue]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setAberto(false);
        setHighlight(-1);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function abrirLista() {
    if (!disabled) {
      setAberto(true);
      void buscar(inputValue);
    }
  }

  function escolher(c: ClienteResumo) {
    onSelect(c);
    setAberto(false);
    setHighlight(-1);
  }

  return (
    <div ref={rootRef} className="cliente-autocomplete">
      <FormField label={label} htmlFor={inputId} required={required} error={fetchError ?? undefined}>
        <div className="cliente-autocomplete__field-row">
          <FieldControl
            id={inputId}
            role="combobox"
            aria-expanded={aberto}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={highlight >= 0 ? `${listId}-opt-${highlight}` : undefined}
            value={inputValue}
            onChange={(e) => {
              onInputValueChange(e.target.value);
              setAberto(true);
              setHighlight(-1);
            }}
            onFocus={abrirLista}
            className="clientes-input"
            variant="modal"
            disabled={disabled}
            placeholder="Nome ou CPF/CNPJ…"
            autoComplete="off"
            required={required}
            aria-required={required}
          />
          {clearable && valueId && !disabled ? (
            <button
              type="button"
              className="cliente-autocomplete__clear"
              onClick={() => {
                onClear?.();
                setOpcoes([]);
                setAberto(false);
              }}
            >
              Limpar
            </button>
          ) : null}
        </div>
        {aberto && !disabled ? (
          <ul id={listId} className="cliente-autocomplete__lista" role="listbox">
            {carregando ? (
              <li className="cliente-autocomplete__item cliente-autocomplete__item--muted" role="presentation">
                A pesquisar…
              </li>
            ) : opcoes.length === 0 ? (
              <li className="cliente-autocomplete__item cliente-autocomplete__item--muted" role="presentation">
                Nenhum cliente encontrado.
              </li>
            ) : (
              opcoes.map((c, idx) => (
                <li
                  key={c.id}
                  id={`${listId}-opt-${idx}`}
                  role="option"
                  aria-selected={valueId === String(c.id)}
                  className={`cliente-autocomplete__item${highlight === idx ? " cliente-autocomplete__item--active" : ""}`}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => escolher(c)}
                >
                  <span className="cliente-autocomplete__nome">{c.razaoSocialOuNome}</span>
                  {c.email ? <span className="cliente-autocomplete__meta">{c.email}</span> : null}
                </li>
              ))
            )}
          </ul>
        ) : null}
      </FormField>
    </div>
  );
}
