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

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe("AppLayout logout confirmation", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    stubMatchMedia(false);
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

describe("AppLayout mobile menu", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    stubMatchMedia(true);
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
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it("abre e fecha o menu com o botao da topbar", () => {
    renderLayout();
    const topbar = document.querySelector(".app-shell-topbar") as HTMLElement;

    fireEvent.click(within(topbar).getByRole("button", { name: "Abrir menu" }));
    expect(screen.getByRole("dialog", { name: "Menu principal" })).toBeVisible();

    fireEvent.click(within(topbar).getByRole("button", { name: "Fechar menu" }));
    expect(within(topbar).getByRole("button", { name: "Abrir menu" })).toBeInTheDocument();
  });

  it("fecha o menu ao pressionar Escape", () => {
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(screen.getByRole("dialog", { name: "Menu principal" })).toBeVisible();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Abrir menu" })).toBeInTheDocument();
  });
});


