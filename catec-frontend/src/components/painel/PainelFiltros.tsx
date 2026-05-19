import FormField from "../form/FormField";
import FieldControl from "../form/FieldControl";
import FiltersCard from "../layout/FiltersCard";
import ClienteAutocomplete from "../projeto/ClienteAutocomplete";
import type { PainelFiltrosState } from "../../pages/painelTypes";
import { FASE_MACRO_OPCOES } from "../../pages/painelTypes";

export type PainelFiltrosProps = {
  filtros: PainelFiltrosState;
  onChange: (next: PainelFiltrosState) => void;
  onClear: () => void;
  onAplicar: () => void;
  clienteFetchError: string | null;
  onClienteFetchError: (msg: string | null) => void;
};

/**
 * Filtros do painel: cliente, fase macro, prazo (atualizado até).
 */
export default function PainelFiltros({
  filtros,
  onChange,
  onClear,
  onAplicar,
  clienteFetchError,
  onClienteFetchError,
}: PainelFiltrosProps) {
  function patch(partial: Partial<PainelFiltrosState>) {
    onChange({ ...filtros, ...partial });
  }

  return (
    <FiltersCard headingId="painel-filtros-titulo" title="Filtros da visão geral" onClear={onClear}>
      <ClienteAutocomplete
        label="Cliente"
        valueId={filtros.clienteId}
        inputValue={filtros.clienteNome}
        onInputValueChange={(clienteNome) => patch({ clienteNome })}
        onSelect={(c) => patch({ clienteId: String(c.id), clienteNome: c.razaoSocialOuNome })}
        clearable
        onClear={() => patch({ clienteId: "", clienteNome: "" })}
        fetchError={clienteFetchError}
        onFetchError={onClienteFetchError}
      />
      <FormField label="Fase macro" htmlFor="painel-filtro-fase">
        <FieldControl
          as="select"
          id="painel-filtro-fase"
          value={filtros.faseMacro}
          onChange={(e) => patch({ faseMacro: e.target.value as PainelFiltrosState["faseMacro"] })}
        >
          <option value="">Todas</option>
          {FASE_MACRO_OPCOES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </FieldControl>
      </FormField>
      <FormField label="Atualizado até" htmlFor="painel-filtro-prazo">
        <FieldControl
          id="painel-filtro-prazo"
          type="date"
          value={filtros.prazoAte}
          onChange={(e) => patch({ prazoAte: e.target.value })}
        />
      </FormField>
      <FormField label=" " htmlFor="painel-filtro-aplicar">
        <button type="button" className="painel-filtros__aplicar" onClick={onAplicar}>
          Aplicar filtros
        </button>
      </FormField>
    </FiltersCard>
  );
}
