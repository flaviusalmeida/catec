import GhostButton from "../../buttons/GhostButton";

type Props = {
  onEditar: () => void;
};

/** Ações globais do detalhe de projeto — somente o que afeta o projeto inteiro. */
export default function ProjetoDetalheHeaderActions({ onEditar }: Props) {
  return (
    <div className="proj-detalhe-header__actions">
      <GhostButton onClick={onEditar}>Editar projeto</GhostButton>
    </div>
  );
}
