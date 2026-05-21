import { useEffect, useRef, useState } from "react";
import GhostButton from "../../buttons/GhostButton";
import PrimaryButton from "../../buttons/PrimaryButton";

type Props = {
  isAdmin: boolean;
  podeNovaProposta: boolean;
  podeRegistrar: boolean;
  onEditar: () => void;
  onNovaProposta: () => void;
  onRegistrar: () => void;
};

export default function ProjetoDetalheHeaderActions({
  isAdmin,
  podeNovaProposta,
  podeRegistrar,
  onEditar,
  onNovaProposta,
  onRegistrar,
}: Props) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuAberto) return;
    function fechar(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [menuAberto]);

  const acoes = (
    <>
      <GhostButton onClick={onEditar}>Editar projeto</GhostButton>
      {isAdmin ? (
        <GhostButton
          onClick={onNovaProposta}
          disabled={!podeNovaProposta}
          title={!podeNovaProposta ? "Não é possível criar nova proposta no momento" : undefined}
        >
          Nova proposta
        </GhostButton>
      ) : null}
      <PrimaryButton onClick={onRegistrar} disabled={!podeRegistrar}>
        Registrar interação
      </PrimaryButton>
    </>
  );

  return (
    <>
      <div className="proj-detalhe-header__actions proj-detalhe-header__actions--desktop">{acoes}</div>
      <div className="proj-detalhe-header__actions proj-detalhe-header__actions--mobile" ref={menuRef}>
        <button
          type="button"
          className="proj-detalhe-actions-trigger"
          aria-expanded={menuAberto}
          aria-haspopup="menu"
          onClick={() => setMenuAberto((v) => !v)}
        >
          ⋮ Ações
        </button>
        {menuAberto ? (
          <div className="proj-detalhe-actions-menu" role="menu">
            <GhostButton
              onClick={() => {
                onEditar();
                setMenuAberto(false);
              }}
            >
              Editar projeto
            </GhostButton>
            {isAdmin ? (
              <GhostButton
                disabled={!podeNovaProposta}
                onClick={() => {
                  onNovaProposta();
                  setMenuAberto(false);
                }}
              >
                Nova proposta
              </GhostButton>
            ) : null}
            <PrimaryButton
              disabled={!podeRegistrar}
              onClick={() => {
                onRegistrar();
                setMenuAberto(false);
              }}
            >
              Registrar interação
            </PrimaryButton>
          </div>
        ) : null}
      </div>
    </>
  );
}
