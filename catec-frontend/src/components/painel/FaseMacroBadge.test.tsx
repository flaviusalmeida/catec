import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FaseMacroBadge from "./FaseMacroBadge";

describe("FaseMacroBadge", () => {
  it("exibe rótulo em português", () => {
    render(<FaseMacroBadge fase="AVALIACAO_SOCIO" />);
    expect(screen.getByText("Avaliação do sócio")).toBeInTheDocument();
  });
});
