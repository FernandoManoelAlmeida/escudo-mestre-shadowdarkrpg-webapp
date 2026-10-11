import { describe, it, expect } from "vitest";
import {
  evaluateBlock,
  isItemTitle,
  isNonItemBody,
  parseItensFromMd,
} from "../scripts/catalogo-itens-magicos-lib";

describe("catalogo-itens-magicos-lib", () => {
  it("aceita ficha de item do livro", () => {
    const body = `*Um arpão de mitral com três pontas.*

Bônus. Lança +2.

Benefício. Você pode respirar debaixo d'água.`;
    const { accept, item } = evaluateBlock("TRIDENTE DOS MARES", body);
    expect(accept).toBe(true);
    expect(item?.nome).toBe("TRIDENTE DOS MARES");
    expect(isNonItemBody(item!.descricao)).toBe(false);
  });

  it("rejeita título de tabela RUMORES", () => {
    expect(isItemTitle("RUMORES")).toBe(false);
    const { accept, reasons } = evaluateBlock(
      "RUMORES",
      "Benefício. algo\n\n| d6 | Resultado |\n| --- | --- |\n| 1 | foo |",
    );
    expect(accept).toBe(false);
    expect(reasons).toContain("bad_title");
  });

  it("rejeita corpo com classe e email", () => {
    const body = `Benefício. teste.

#### Rodrigo Avelino Rosa , rodrigo.avelino.rosa@hotmail.com

# Classe: Cavaleiro de São Ydris`;
    const { accept, reasons } = evaluateBlock("KYTHEROS", body);
    expect(accept).toBe(false);
    expect(reasons).toContain("non_item_body");
  });

  it("parseItensFromMd mantém só blocos válidos", () => {
    const md = `# Catálogo

### ANEL DA QUEDA SUAVE
Benefício. Uma vez por dia, queda suave.

### RUMORES
Benefício. foo
| d6 | x |
| --- | --- |
| 1 | y |
`;
    const { itens, skipped } = parseItensFromMd(md);
    expect(itens).toHaveLength(1);
    expect(itens[0].nome).toBe("ANEL DA QUEDA SUAVE");
    expect(skipped).toHaveLength(1);
    expect(skipped[0].nome).toBe("RUMORES");
  });
});
