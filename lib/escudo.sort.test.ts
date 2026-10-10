import { describe, it, expect } from "vitest";
import { sortGlossary, type GlossaryItem } from "./escudo";

describe("sortGlossary", () => {
  const items: GlossaryItem[] = [
    { term: "Z", fullName: "", description: "" },
    { term: "A", fullName: "", description: "" },
  ];

  it("ordena por termo asc", () => {
    expect(sortGlossary(items, "asc").map((g) => g.term)).toEqual(["A", "Z"]);
  });

  it("ordena por termo desc", () => {
    expect(sortGlossary(items, "desc").map((g) => g.term)).toEqual(["Z", "A"]);
  });
});
