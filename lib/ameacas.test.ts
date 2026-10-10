import { describe, it, expect } from "vitest";
import { filterAmeacas, type AmeacasData, type Criatura } from "./ameacas";

function criatura(partial: Partial<Criatura> & Pick<Criatura, "id" | "nome" | "nv">): Criatura {
  return {
    al: "N",
    ca: 10,
    pv: 1,
    atq: "1",
    mv: "Perto",
    atributos: { F: 0, D: 0, C: 0, I: 0, S: 0, Car: 0 },
    tracos: [],
    origem: "oficial",
    ...partial,
  };
}

const data: AmeacasData = {
  ameacas: [
    criatura({ id: "b", nome: "Bárbaro", nv: 3 }),
    criatura({ id: "a", nome: "Aranha", nv: 0 }),
    criatura({ id: "c", nome: "Cobra", nv: 5 }),
  ],
};

describe("filterAmeacas ordenação", () => {
  it("ordena por nome asc", () => {
    const list = filterAmeacas(data, { ordenarPor: "nome", ordenarSentido: "asc" });
    expect(list.map((c) => c.nome)).toEqual(["Aranha", "Bárbaro", "Cobra"]);
  });

  it("ordena por nome desc", () => {
    const list = filterAmeacas(data, { ordenarPor: "nome", ordenarSentido: "desc" });
    expect(list.map((c) => c.nome)).toEqual(["Cobra", "Bárbaro", "Aranha"]);
  });

  it("ordena por NV desc", () => {
    const list = filterAmeacas(data, { ordenarPor: "nv", ordenarSentido: "desc" });
    expect(list.map((c) => c.nv)).toEqual([5, 3, 0]);
  });

  it("ordena por NV asc", () => {
    const list = filterAmeacas(data, { ordenarPor: "nv", ordenarSentido: "asc" });
    expect(list.map((c) => c.nv)).toEqual([0, 3, 5]);
  });
});
