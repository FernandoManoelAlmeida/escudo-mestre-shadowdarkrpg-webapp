import { describe, it, expect, vi, afterEach } from "vitest";
import {
  scrollToTabelaElement,
  tabelaElementId,
} from "./scrollToTabelaHash";

describe("scrollToTabelaHash", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("tabelaElementId prefixa id", () => {
    expect(tabelaElementId("rumores-taverna")).toBe("tabela-rumores-taverna");
  });

  it("scrollToTabelaElement chama scrollIntoView quando elemento existe", () => {
    const el = document.createElement("section");
    el.id = "tabela-teste";
    Object.defineProperty(el, "offsetHeight", { value: 100 });
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);

    scrollToTabelaElement("teste", { followUpMs: 0, maxAttempts: 1 });

    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        expect(el.scrollIntoView).toHaveBeenCalled();
        resolve();
      });
    });
  });
});
