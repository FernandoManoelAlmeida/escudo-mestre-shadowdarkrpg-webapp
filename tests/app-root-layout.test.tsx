import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import RootLayout from "@/app/layout";
import React from "react";

describe("app/layout RootLayout", () => {
  it("contém estrutura html/body, children e fonte JSL no HTML gerado", () => {
    const html = renderToString(
      <RootLayout>
        <div data-testid="child">página</div>
      </RootLayout>,
    );

    expect(html).toContain("página");
    expect(html).not.toContain("--header-height");
    expect(html).toContain("<html");
    expect(html).toContain("<body");
    expect(html).toContain("JBLACK.TTF");
    expect(html).toContain("JSL Blackletter");
    expect(html).toContain('rel="preload"');
    expect(html).toContain("font-display:block");
  });
});
