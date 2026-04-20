import { describe, expect, it, beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "./LoginPage";

const loginWithTokenMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    loginWithToken: loginWithTokenMock,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    cleanup();
    loginWithTokenMock.mockClear();
    vi.restoreAllMocks();
  });

  it("envia login e persiste token quando API retorna sucesso", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          tokenType: "Bearer",
          accessToken: "jwt-token",
          expiresInSeconds: 3600,
          trocaSenhaObrigatoria: false,
        }),
    } as Response);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "admin@catec.local" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(loginWithTokenMock).toHaveBeenCalledWith("jwt-token");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("exibe mensagem de erro quando API retorna falha", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ mensagem: "Credenciais inválidas." }),
    } as Response);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "admin@catec.local" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "errada" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Credenciais inválidas.");
    expect(loginWithTokenMock).not.toHaveBeenCalled();
  });
});
