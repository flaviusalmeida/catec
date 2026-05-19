import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CanRole from "./CanRole";

const useAuthMock = vi.fn();

vi.mock("./AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("CanRole", () => {
  it("renderiza children quando perfil coincide", () => {
    useAuthMock.mockReturnValue({ user: { perfis: ["ADMINISTRATIVO"] } });
    render(
      <CanRole anyOf={["ADMINISTRATIVO"]}>
        <span>Visível</span>
      </CanRole>,
    );
    expect(screen.getByText("Visível")).toBeInTheDocument();
  });

  it("oculta children quando perfil não coincide", () => {
    useAuthMock.mockReturnValue({ user: { perfis: ["COLABORADOR"] } });
    render(
      <CanRole anyOf={["ADMINISTRATIVO"]}>
        <span>Oculto</span>
      </CanRole>,
    );
    expect(screen.queryByText("Oculto")).not.toBeInTheDocument();
  });
});
