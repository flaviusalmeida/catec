import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import AppLayout from "./AppLayout";

const logoutMock = vi.fn();
const navigateMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("AppLayout logout confirmation", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: { nome: "Admin", email: "admin@catec.local" },
      isAdmin: true,
      podeGerirProjetos: true,
      logout: logoutMock,
    });
  });

  function renderLayout() {
    return render(
      <MemoryRouter initialEntries={["/app/inicio"]}>
        <Routes>
          <Route path="/app" element={<AppLayout />}>
            <Route path="inicio" element={<div>Inicio</div>} />
            <Route path="usuarios" element={<div>Usuarios</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it("nao desloga quando usuario cancela a confirmacao", async () => {
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(screen.getByRole("dialog", { name: "Confirmar saida" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(logoutMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Confirmar saida" })).not.toBeInTheDocument();
  });

  it("desloga e redireciona quando usuario confirma saida", async () => {
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    const dialog = screen.getByRole("dialog", { name: "Confirmar saida" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Sair" }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
  });
});
