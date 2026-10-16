import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme } from "./utils/render-theme";

describe("COPYRIGHT_FREE UI", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("Mastershield wordmark renderiza o texto exacto", async () => {
    const { ShadowdarkMastershieldWordmark } = await import(
      "@/components/branding/ShadowdarkMastershieldWordmark"
    );
    renderWithTheme(<ShadowdarkMastershieldWordmark />);
    const mark = screen.getByRole("img", { name: "Shadowdark Mastershield" });
    expect(mark).toHaveTextContent(/Shadowdark/);
    expect(mark).toHaveTextContent(/Mastershield/);
  });

  it("Spot Art some com flag on", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "1");
    vi.resetModules();
    const { ShadowdarkSpotArtLogo } = await import(
      "@/components/branding/ShadowdarkSpotArtLogo"
    );
    const { container } = renderWithTheme(
      <ShadowdarkSpotArtLogo alt="Logo" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("Spot Art visível com flag off", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "");
    vi.resetModules();
    const { ShadowdarkSpotArtLogo } = await import(
      "@/components/branding/ShadowdarkSpotArtLogo"
    );
    renderWithTheme(<ShadowdarkSpotArtLogo alt="Logo" />);
    expect(screen.getByRole("img", { name: "Logo" })).toBeInTheDocument();
  });

  it("DiceIcon usa texto com flag on", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "1");
    vi.resetModules();
    const { DiceIcon } = await import("@/components/ui/DiceIcon");
    const { container } = renderWithTheme(<DiceIcon sides={20} />);
    expect(container.textContent).toMatch(/d20/);
    expect(container.querySelector("img")).toBeNull();
  });

  it("DiceIcon usa img com flag off", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "");
    vi.resetModules();
    const { DiceIcon } = await import("@/components/ui/DiceIcon");
    const { container } = renderWithTheme(<DiceIcon sides={6} />);
    expect(container.querySelector("img")).toBeTruthy();
  });

  it("CopyrightedAsset oculta filhos com flag on", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "1");
    vi.resetModules();
    const { CopyrightedAsset } = await import(
      "@/components/branding/CopyrightedAsset"
    );
    const { container } = renderWithTheme(
      <CopyrightedAsset>
        <span>segredo</span>
      </CopyrightedAsset>,
    );
    expect(container.textContent).not.toContain("segredo");
  });

  it("CopyrightedAsset mostra filhos com flag off", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "");
    vi.resetModules();
    const { CopyrightedAsset } = await import(
      "@/components/branding/CopyrightedAsset"
    );
    renderWithTheme(
      <CopyrightedAsset>
        <span>visivel</span>
      </CopyrightedAsset>,
    );
    expect(screen.getByText("visivel")).toBeInTheDocument();
  });
});
