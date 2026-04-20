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

  it("esconde botão de redefinir senha quando conta editada está inativa", async () => {
    useAuthMock.mockReturnValue({ isAdmin: true, logout: logoutMock });
    apiFetchMock.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => [
        {
          id: 2,
          nome: "Conta Inativa",
          email: "inativa@catec.local",
          telefone: null,
          ativo: false,
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

    expect(await screen.findByText("Conta Inativa")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Editar Conta Inativa" }));

    expect(await screen.findByRole("dialog", { name: "Editar usuário" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Redefinir senha" })).not.toBeInTheDocument();
  });

  it("abre confirmação customizada e confirma redefinição de senha", async () => {
    useAuthMock.mockReturnValue({ isAdmin: true, logout: logoutMock });
    apiFetchMock
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => [
          {
            id: 10,
            nome: "Usuário Ativo",
            email: "ativo@catec.local",
            telefone: null,
            ativo: true,
            requerTrocaSenha: false,
            perfis: ["COLABORADOR"],
            criadoEm: "2026-01-01T00:00:00Z",
            atualizadoEm: "2026-01-01T00:00:00Z",
          },
        ],
      })
      .mockResolvedValueOnce({
        status: 204,
        ok: true,
        json: async () => null,
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => [
          {
            id: 10,
            nome: "Usuário Ativo",
            email: "ativo@catec.local",
            telefone: null,
            ativo: false,
            requerTrocaSenha: true,
            perfis: ["COLABORADOR"],
            criadoEm: "2026-01-01T00:00:00Z",
            atualizadoEm: "2026-01-01T00:00:00Z",
          },
        ],
      });

    const confirmSpy = vi.spyOn(window, "confirm");

    render(
      <MemoryRouter>
        <UsuariosPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Usuário Ativo")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Editar Usuário Ativo" }));
    expect(await screen.findByRole("dialog", { name: "Editar usuário" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));
    expect(await screen.findByRole("dialog", { name: "Confirmar redefinição" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith("/api/v1/admin/usuarios/10/resetar-senha", { method: "POST" }),
    );
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(await screen.findByText("Nova senha provisória enviada por e-mail.")).toBeVisible();
  });
});
