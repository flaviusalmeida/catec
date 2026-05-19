import { describe, expect, it } from "vitest";
import { dateInputToPrazoAteIso, formatInstantBr } from "./dateTimeBr";

describe("dateTimeBr", () => {
  it("formatInstantBr retorna traço para vazio", () => {
    expect(formatInstantBr(null)).toBe("—");
  });

  it("dateInputToPrazoAteIso gera ISO no fim do dia local", () => {
    const iso = dateInputToPrazoAteIso("2026-05-19");
    expect(iso).toBeTruthy();
    const d = new Date(iso!);
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
  });
});
