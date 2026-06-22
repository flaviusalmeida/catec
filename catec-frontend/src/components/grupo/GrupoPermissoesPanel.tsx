import type { GrupoFormState, PermissaoCatalogo } from "../../pages/grupoTypes";
import { agruparPermissoesPorModulo, modulosOrdenados, rotuloModulo } from "../../pages/grupoTypes";
import { DashboardCard } from "../projeto/detalhe/detalheUi";
import "../table/RowEditButton.css";

type Props = {
  catalogo: PermissaoCatalogo[];
  form: GrupoFormState;
  disabled?: boolean;
  filtro: string;
  onToggle: (codigo: string) => void;
  onToggleModulo: (codigos: string[], marcar: boolean) => void;
};

export default function GrupoPermissoesPanel({
  catalogo,
  form,
  disabled = false,
  filtro,
  onToggle,
  onToggleModulo,
}: Props) {
  const termo = filtro.trim().toLowerCase();
  const catalogoFiltrado = termo
    ? catalogo.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) ||
          p.codigo.toLowerCase().includes(termo) ||
          (p.descricao?.toLowerCase().includes(termo) ?? false) ||
          rotuloModulo(p.modulo).toLowerCase().includes(termo),
      )
    : catalogo;

  const porModulo = agruparPermissoesPorModulo(catalogoFiltrado);
  const modulos = modulosOrdenados(porModulo);

  if (modulos.length === 0) {
    return <p className="grupo-form-empty">Nenhuma permissão corresponde à busca.</p>;
  }

  return (
    <div className="grupo-permissoes-grid">
      {modulos.map((modulo) => {
        const permissoes = porModulo.get(modulo) ?? [];
        const codigos = permissoes.map((p) => p.codigo);
        const marcadas = codigos.filter((c) => form.permissoes.has(c)).length;
        const todasMarcadas = marcadas === codigos.length;

        return (
          <DashboardCard
            key={modulo}
            title={rotuloModulo(modulo)}
            titleId={`grupo-modulo-${modulo}`}
            className="grupo-permissoes-card"
            actions={
              <button
                type="button"
                className="row-edit-button grupo-permissoes-modulo-action"
                disabled={disabled}
                onClick={() => onToggleModulo(codigos, !todasMarcadas)}
                title={todasMarcadas ? "Limpar seleção do módulo" : "Marcar todas do módulo"}
                aria-label={todasMarcadas ? "Limpar seleção do módulo" : "Marcar todas do módulo"}
              >
                {todasMarcadas ? (
                  <svg className="row-edit-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg className="row-edit-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <span>{todasMarcadas ? "Limpar" : "Marcar todas"}</span>
              </button>
            }
          >
            <ul className="grupo-permissoes-list">
              {permissoes.map((p) => (
                <li key={p.codigo} className="grupo-permissao-item">
                  <label className="grupo-permissao-item__label" htmlFor={`perm-${p.codigo}`}>
                    <input
                      id={`perm-${p.codigo}`}
                      type="checkbox"
                      className="grupo-permissao-item__input"
                      checked={form.permissoes.has(p.codigo)}
                      onChange={() => onToggle(p.codigo)}
                      disabled={disabled}
                    />
                    <span className="grupo-permissao-item__text">
                      <span className="grupo-permissao-item__title">{p.nome}</span>
                      {p.descricao ? (
                        <span className="grupo-permissao-item__desc">{p.descricao}</span>
                      ) : null}
                    </span>
                    <span
                      className={`grupo-permissao-item__tipo grupo-permissao-item__tipo--${p.tipo === "TELA" ? "tela" : "acao"}`}
                    >
                      {p.tipo === "TELA" ? "Tela" : "Ação"}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </DashboardCard>
        );
      })}
    </div>
  );
}
