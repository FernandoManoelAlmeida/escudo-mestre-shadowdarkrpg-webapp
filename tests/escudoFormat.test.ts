import { describe, it, expect } from "vitest";
import { formatEscudoSectionHeading } from "@/lib/escudo";

describe("formatEscudoSectionHeading", () => {
  it("formata capítulo numérico do livro", () => {
    expect(
      formatEscudoSectionHeading({ id: "6", title: "MJ e progressão" }),
    ).toBe("§ 6 — MJ e progressão");
  });

  it("usa chapter em homebrew com número de listagem", () => {
    expect(
      formatEscudoSectionHeading({
        id: "multiclasse-simples",
        title: "Multiclasse simples",
        chapter: "7",
      }),
    ).toBe("§ 7 — Multiclasse simples");
  });
});
