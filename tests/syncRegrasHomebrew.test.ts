import { describe, it, expect } from "vitest";
import { descricaoToSubsections } from "../scripts/sync-regras-homebrew-escudo.js";

describe("descricaoToSubsections", () => {
  it("mantém ### dentro do bloco ## pai", () => {
    const md = [
      "## Regras base",
      "",
      "### Escolha na criação",
      "",
      "1. Escolha duas classes.",
      "",
      "## Próxima seção",
      "",
      "Texto.",
    ].join("\n");
    const subs = descricaoToSubsections(md);
    const base = subs.find((s) => s.title === "Regras base");
    expect(base?.content).toContain("Escolha na criação");
    expect(base?.content).toContain("duas classes");
    expect(base?.content).not.toBe("#");
  });
});
