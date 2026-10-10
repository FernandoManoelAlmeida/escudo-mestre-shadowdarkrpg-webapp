import { describe, it, expect } from "vitest";
import { sortCatalogoItens } from "./itensMagicos";

describe("sortCatalogoItens", () => {
  const itens = [
    { nome: "Zeta", descricao: "" },
    { nome: "Alfa", descricao: "" },
  ];

  it("ordena asc", () => {
    expect(sortCatalogoItens(itens, "asc").map((i) => i.nome)).toEqual([
      "Alfa",
      "Zeta",
    ]);
  });

  it("ordena desc", () => {
    expect(sortCatalogoItens(itens, "desc").map((i) => i.nome)).toEqual([
      "Zeta",
      "Alfa",
    ]);
  });
});
