import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CanPermission from "./CanPermission";
import { PermissaoCodigo } from "./permissao";

const useAuthMock = vi.fn();

vi.mock("./AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("CanPermission", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });  it("exibe children quando permissão presente", () => {
    useAuthMock.mockReturnValue({
      user: { permissoes: [PermissaoCodigo.TELA_USUARIOS] },
    });
    render(
      <CanPermission code={PermissaoCodigo.TELA_USUARIOS}>
        <span>Visível</span>
      </CanPermission>,
    );
    expect(screen.getByText("Visível")).toBeInTheDocument();
  });

  it("oculta children quando permissão ausente", () => {
    useAuthMock.mockReturnValue({
      user: { permissoes: [PermissaoCodigo.TELA_PAINEL] },
    });
    render(
      <CanPermission code={PermissaoCodigo.TELA_USUARIOS}>
        <span>Visível</span>
      </CanPermission>,
    );
    expect(screen.queryByText("Visível")).not.toBeInTheDocument();
  });
});
