import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithTheme } from "./utils/render-theme";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

describe("COPYRIGHT_FREE navegação", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("BottomNav omite Geradores com flag on", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "1");
    vi.resetModules();
    const BottomNav = (await import("@/components/layout/BottomNav")).default;
    renderWithTheme(<BottomNav />);
    expect(
      screen.queryByRole("link", { name: /geradores/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /início/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /regras/i })).toBeInTheDocument();
  });

  it("BottomNav inclui Geradores com flag off", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "");
    vi.resetModules();
    const BottomNav = (await import("@/components/layout/BottomNav")).default;
    renderWithTheme(<BottomNav />);
    expect(
      screen.getByRole("link", { name: /geradores/i }),
    ).toBeInTheDocument();
  });

  it("RouteGate redireciona tabelas com flag on", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "1");
    vi.resetModules();
    const { CopyrightFreeRouteGate } = await import(
      "@/components/copyright/CopyrightFreeRouteGate"
    );
    const { isCopyrightFreeRouteEnabled } = await import(
      "@/lib/copyrightFreeRoutes"
    );
    renderWithTheme(
      <CopyrightFreeRouteGate
        enabled={isCopyrightFreeRouteEnabled("/regras/tabelas")}
        fallback="/regras"
      >
        <p>conteudo tabelas</p>
      </CopyrightFreeRouteGate>,
    );
    expect(screen.queryByText("conteudo tabelas")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/regras");
    });
  });

  it("SolodarkOracleWidget some com flag on", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "1");
    vi.resetModules();
    const { SolodarkOracleWidget } = await import(
      "@/components/home/SolodarkOracleWidget"
    );
    const { RollToastProvider } = await import("@/context/RollToastContext");
    const { ThemeProvider } = await import("styled-components");
    const { theme } = await import("@/lib/theme");
    const { render } = await import("@testing-library/react");
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RollToastProvider>
          <SolodarkOracleWidget />
        </RollToastProvider>
      </ThemeProvider>,
    );
    expect(container.firstChild).toBeNull();
  });
});
