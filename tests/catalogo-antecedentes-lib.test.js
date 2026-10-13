import { describe, it, expect } from "vitest";
import {
  parseAntecedenteTableRows,
  splitAntecedenteCell,
  parseAntecedentesFromMd,
} from "../scripts/catalogo-personagem-lib";

describe("catalogo antecedentes lib", () => {
  it("splitAntecedenteCell separa nome e descrição", () => {
    const { nome, descricao } = splitAntecedenteCell(
      "Menestrel. Você viajou por longas distâncias.",
    );
    expect(nome).toBe("Menestrel");
    expect(descricao).toContain("viajou");
  });

  it("parseAntecedenteTableRows lê tabela d20", () => {
    const md = `
| d20 | Resultado |
| --- | --- |
| 1 | Moleque. Você cresceu nas ruas. |
| 2 | Procurado. Há um preço pela sua cabeça. |
`;
    const rows = parseAntecedenteTableRows(md);
    expect(rows).toHaveLength(2);
    expect(rows[0].numero).toBe(1);
    expect(rows[0].nome).toBe("Moleque");
  });

  it("parseAntecedentesFromMd preserva lista e id", () => {
    const md = `# Catálogo

---
## Teste
*Id: livro-teste*
*Fonte: livro*
*Lista: Livro de Regras (d20)*
*Rolagem: d20*
*Número: 1*

Descrição curta.
`;
    const { entradas } = parseAntecedentesFromMd(md);
    expect(entradas).toHaveLength(1);
    expect(entradas[0].id).toBe("livro-teste");
    expect(entradas[0].lista).toBe("Livro de Regras (d20)");
    expect(entradas[0].numero).toBe(1);
  });
});
