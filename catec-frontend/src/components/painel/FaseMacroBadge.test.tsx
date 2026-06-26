import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FaseMacroBadge from "./FaseMacroBadge";

describe("FaseMacroBadge", () => {
  it("exibe rótulo curto com título completo", () => {
    render(<FaseMacroBadge fase="AVALIACAO_SOCIO" />);
    expect(screen.getByText("Em avaliação")).toBeInTheDocument();
    expect(screen.getByTitle("Avaliação do sócio")).toBeInTheDocument();
  });
});
