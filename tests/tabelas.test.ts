import { describe, it, expect } from "vitest";
import { formatTabelaTituloExibicao } from "@/lib/tabelas";

describe("formatTabelaTituloExibicao", () => {
  it("coloca título em caixa alta pt-BR preservando acentos", () => {
    expect(formatTabelaTituloExibicao("Reação de encontro")).toBe(
      "REAÇÃO DE ENCONTRO",
    );
  });
});
