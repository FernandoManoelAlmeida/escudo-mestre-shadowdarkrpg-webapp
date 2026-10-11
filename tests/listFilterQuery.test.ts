import { describe, it, expect } from "vitest";
import {
  buildQueryString,
  decodeSortOrder,
  encodeSortOrder,
  hasActiveFilters,
  joinCsv,
  parseFilterValuesFromSearchParams,
  splitCsv,
} from "@/lib/listFilterQuery";

describe("listFilterQuery", () => {
  it("encode/decode sort", () => {
    expect(encodeSortOrder("nome", "asc")).toBe("nome:asc");
    expect(decodeSortOrder("nv:desc", { por: "nome", sentido: "asc" })).toEqual({
      por: "nv",
      sentido: "desc",
    });
    expect(decodeSortOrder("bad", { por: "nome", sentido: "asc" })).toEqual({
      por: "nome",
      sentido: "asc",
    });
  });

  it("csv join/split", () => {
    expect(joinCsv(["a", "b"])).toBe("a,b");
    expect(splitCsv("x, y")).toEqual(["x", "y"]);
  });

  it("parseFilterValuesFromSearchParams", () => {
    const sp = new URLSearchParams("q=lobo&origem=homebrew");
    expect(
      parseFilterValuesFromSearchParams(
        { q: "", origem: "todas", al: "todas" },
        sp,
      ),
    ).toEqual({ q: "lobo", origem: "homebrew", al: "todas" });
  });

  it("hasActiveFilters e buildQueryString", () => {
    const defaults = { q: "", origem: "todas" };
    expect(hasActiveFilters(defaults, { q: "", origem: "todas" })).toBe(false);
    expect(hasActiveFilters(defaults, { q: "x", origem: "todas" })).toBe(true);
    expect(
      buildQueryString({ q: "x", origem: "todas" }, defaults),
    ).toBe("?q=x");
    expect(buildQueryString(defaults, defaults)).toBe("");
  });
});
