import { describe, it, expect } from "vitest";
import { sortMagias } from "./magiasFormat";
import type { Magia } from "./magias";

function magia(partial: Partial<Magia> & Pick<Magia, "id" | "nome">): Magia {
  return {
    descricao: "",
    origem: "livro",
    listas: ["mago"],
    grau: {},
    ...partial,
  };
}

describe("sortMagias", () => {
  const magias = [
    magia({ id: "b", nome: "BOLA DE FOGO", grau: { mago: 3 } }),
    magia({ id: "a", nome: "ALARME", grau: { sacerdote: 1 } }),
    magia({
      id: "c",
      nome: "CURAR",
      grau: { mago: 1, sacerdote: 2 },
      listas: ["mago", "sacerdote"],
    }),
  ];

  it("ordena por nome asc", () => {
    const out = sortMagias(magias, { ordenarPor: "nome", ordenarSentido: "asc" });
    expect(out.map((m) => m.nome)).toEqual(["ALARME", "BOLA DE FOGO", "CURAR"]);
  });

  it("ordena por grau asc usando menor grau sem filtro de classe", () => {
    const out = sortMagias(magias, { ordenarPor: "grau", ordenarSentido: "asc" });
    expect(out.map((m) => m.id)).toEqual(["a", "c", "b"]);
  });

  it("ordena por grau com filtro de classe mago", () => {
    const out = sortMagias(magias, {
      ordenarPor: "grau",
      ordenarSentido: "asc",
      classeFiltro: "mago",
    });
    expect(out.map((m) => m.id)).toEqual(["c", "b", "a"]);
  });
});
