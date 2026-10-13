import { describe, it, expect } from "vitest";
import {
  ameacaDisplayNome,
  filterAmeacas,
  fonteParaFicha,
  getAlinhamentosParaFiltro,
  labelAlinhamento,
  tipoParaListagem,
  type AmeacasData,
} from "@/lib/ameacas";
import type { Criatura } from "@/lib/ameacas";

function criatura(partial: Partial<Criatura> & Pick<Criatura, "id" | "nome">): Criatura {
  return {
    ca: 10,
    pv: 10,
    atq: "",
    mv: "Perto",
    atributos: { F: 0, D: 0, C: 0, I: 0, S: 0, Car: 0 },
    al: "N",
    nv: 1,
    tracos: [],
    origem: "oficial",
    ...partial,
  };
}

describe("ameacaDisplayNome", () => {
  it("exibe nome em caixa alta pt-BR", () => {
    expect(ameacaDisplayNome("Criatura Teste")).toBe("CRIATURA TESTE");
  });
});

describe("tipoParaListagem", () => {
  it("homebrew nunca mostra tipo no card (só NV · AL)", () => {
    const c = criatura({
      id: "putaria",
      nome: "PUT'ARIA",
      origem: "homebrew",
      tipo: "Humanóide (Matriprole)",
    });
    expect(tipoParaListagem(c)).toBeUndefined();
  });

  it("oficial mantém tipo curto quando presente", () => {
    const c = criatura({
      id: "aranha",
      nome: "ARANHA",
      tipo: "Besta",
    });
    expect(tipoParaListagem(c)).toBe("Besta");
  });
});

describe("fonteParaFicha", () => {
  it("homebrew nunca mostra fonte na ficha", () => {
    const c = criatura({
      id: "cavaleiro-matriprole",
      nome: "CAVALEIRO MATRIPROLE",
      origem: "homebrew",
      fonte: "Matriprole Matrímpio",
    });
    expect(fonteParaFicha(c)).toBeUndefined();
  });

});

describe("labelAlinhamento", () => {
  it("usa C/N/O do livro", () => {
    expect(labelAlinhamento("C")).toBe("C — Caótico");
    expect(labelAlinhamento("N")).toBe("N — Neutro");
    expect(labelAlinhamento("O")).toBe("O — Ordeiro");
  });
});

describe("filterAmeacas por AL", () => {
  const data: AmeacasData = {
    ameacas: [
      criatura({ id: "a", nome: "A", al: "C", nv: 1 }),
      criatura({ id: "b", nome: "B", al: "O", nv: 1 }),
      criatura({ id: "c", nome: "C", al: "o", nv: 1 }),
    ],
  };

  it("filtra por alinhamento (case-insensitive)", () => {
    const list = filterAmeacas(data, { al: "O" });
    expect(list.map((c) => c.id).sort()).toEqual(["b", "c"]);
  });

  it("getAlinhamentosParaFiltro ordena O, N, C", () => {
    const codes = getAlinhamentosParaFiltro(data);
    expect(codes).toEqual(["O", "C"]);
  });
});

describe("fonteParaFicha suplemento", () => {
  it("mantém fonte distinta do nome (ex. suplemento)", () => {
    const c = criatura({
      id: "x",
      nome: "MONSTRO",
      fonte: "Cursed Scroll 2",
    });
    expect(fonteParaFicha(c)).toBe("Cursed Scroll 2");
  });
});
