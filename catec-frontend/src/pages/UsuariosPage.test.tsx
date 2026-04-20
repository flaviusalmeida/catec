import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import UsuariosPage from "./UsuariosPage";

const logoutMock = vi.fn();
const apiFetchMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("../api/http", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe("UsuariosPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("exibe aviso de acesso negado para usuário sem perfil admin", async () => {
    useAuthMock.mockReturnValue({ isAdmin: false, logout: logoutMock });

    render(
      <MemoryRouter>
        <UsuariosPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Seu perfil não inclui permissão de administrador técnico para esta tela.")).toBeVisible();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("filtra tabela por nome", async () => {
    useAuthMock.mockReturnValue({ isAdmin: true, logout: logoutMock });
    apiFetchMock.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => [
        {
          id: 1,
          nome: "Administrador dev",
          email: "admin@catec.local",
          telefone: null,
          ativo: true,
          requerTrocaSenha: false,
          perfis: ["ADMINISTRATIVO"],
          criadoEm: "2026-01-01T00:00:00Z",
          atualizadoEm: "2026-01-01T00:00:00Z",
        },
        {
          id: 2,
          nome: "Maria Operacional",
          email: "maria@catec.local",
          telefone: null,
          ativo: true,
          requerTrocaSenha: false,
          perfis: ["COLABORADOR"],
          criadoEm: "2026-01-01T00:00:00Z",
          atualizadoEm: "2026-01-01T00:00:00Z",
        },
      ],
    });

    render(
      <MemoryRouter>
        <UsuariosPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Administrador dev")).toBeVisible();
    expect(screen.getByText("Maria Operacional")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "maria" } });

    await waitFor(() => expect(screen.queryByText("Administrador dev")).not.toBeInTheDocument());
    expect(screen.getByText("Maria Operacional")).toBeVisible();
  });
});
