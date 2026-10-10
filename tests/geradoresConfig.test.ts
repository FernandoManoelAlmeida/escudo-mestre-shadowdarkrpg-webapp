import { describe, it, expect } from "vitest";
import {
  regrasTabelaHref,
  parseRegrasTabelaHash,
} from "@/lib/geradoresConfig";

describe("geradoresConfig regras tabelas", () => {
  it("regrasTabelaHref inclui âncora por id", () => {
    expect(regrasTabelaHref("armadilhas")).toBe(
      "/regras/tabelas#tabela-armadilhas",
    );
    expect(regrasTabelaHref("solodark-oraculo")).toBe(
      "/regras/tabelas#tabela-solodark-oraculo",
    );
  });

  it("parseRegrasTabelaHash extrai id do hash", () => {
    expect(parseRegrasTabelaHash("#tabela-reacao")).toBe("reacao");
    expect(parseRegrasTabelaHash("")).toBeNull();
    expect(parseRegrasTabelaHash("#outro")).toBeNull();
  });
});
