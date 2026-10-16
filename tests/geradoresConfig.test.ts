import { describe, it, expect } from "vitest";
import {
  GERADOR_MODULES,
  geradorCardsFromModules,
  matchesGeradorCard,
  regrasTabelaHref,
  parseRegrasTabelaHash,
  sortGeradorCards,
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

  it("filtra e ordena cards de geradores", () => {
    const cards = geradorCardsFromModules(
      GERADOR_MODULES.filter((m) => m.slug === "reacao" || m.slug === "armadilhas"),
    );
    expect(cards.length).toBeGreaterThanOrEqual(2);
    const reacao = cards.find((c) => c.slug === "reacao");
    expect(reacao && matchesGeradorCard(reacao, "reação")).toBe(true);
    const sorted = sortGeradorCards(cards, "asc");
    expect(sorted[0].title.localeCompare(sorted[1].title, "pt-BR")).toBeLessThanOrEqual(
      0,
    );
  });

  it("sem módulos não injecta card fantasma de itens mágicos", () => {
    expect(geradorCardsFromModules([])).toEqual([]);
  });
});

