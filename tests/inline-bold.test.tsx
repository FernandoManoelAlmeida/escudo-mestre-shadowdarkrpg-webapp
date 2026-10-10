import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InlineBold, { parseAsterisksAsBold } from "@/components/ui/InlineBold";

describe("parseAsterisksAsBold", () => {
  it("retorna vazio para não-string ou string vazia", () => {
    expect(parseAsterisksAsBold("")).toEqual([]);
    // @ts-expect-error cobertura defensiva
    expect(parseAsterisksAsBold(null)).toEqual([]);
  });

  it("processa **negrito** e *simples*", () => {
    const nodes = parseAsterisksAsBold("a **b** c *d* e");
    expect(nodes[0]).toBe("a ");
    expect(nodes[2]).toBe(" c ");
    expect(nodes[4]).toBe(" e");
  });

  it("texto sem asteriscos retorna o texto num único nó", () => {
    expect(parseAsterisksAsBold("só texto")).toEqual(["só texto"]);
  });
});

describe("InlineBold", () => {
  it("renderiza como span com strong interno", () => {
    render(<InlineBold>**teste**</InlineBold>);
    expect(
      screen.getByText("teste", { selector: "strong" }),
    ).toBeInTheDocument();
  });

  it("aceita elemento semântico via as", () => {
    render(<InlineBold as="p">*um*</InlineBold>);
    const p = screen.getByText("um", { selector: "strong" }).closest("p");
    expect(p?.tagName).toBe("P");
  });
});
