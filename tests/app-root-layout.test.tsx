import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import RootLayout from "@/app/layout";
import React from "react";

describe("app/layout RootLayout", () => {
  it("contém metadados e script de --header-height no HTML gerado", () => {
    const html = renderToString(
      <RootLayout>
        <div data-testid="child">página</div>
      </RootLayout>,
    );

    // Verifica se os filhos estão presentes
    expect(html).toContain("página");

    // Verifica a presença do CSS custom property no script inline
    expect(html).toContain("--header-height");
    expect(html).toContain("48px");

    // Verifica as tags básicas estruturais
    expect(html).toContain("<html");
    expect(html).toContain("<body");
  });
});
