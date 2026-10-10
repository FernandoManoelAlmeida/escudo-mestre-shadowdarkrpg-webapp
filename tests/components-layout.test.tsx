import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithTheme } from "./utils/render-theme";
import StyledComponentsRegistry from "@/components/layout/Registry";
import ClientLayout from "@/components/layout/ClientLayout";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import { QuickRollBar } from "@/components/layout/QuickRollBar";
import UpdateBanner from "@/components/layout/UpdateBanner";
import RollToaster from "@/components/ui/RollToaster";
import {
  mockUsePathname,
  serverInsertedHtmlCallbacks,
} from "./setup/next-mocks.tsx";
import React from "react";

describe("layout components", () => {
  beforeEach(() => {
    serverInsertedHtmlCallbacks.length = 0;
    vi.stubEnv("NODE_ENV", "production");
    mockUsePathname.mockReturnValue("/");
    vi.stubGlobal(
      "localStorage",
      (() => {
        let store: Record<string, string> = {};
        return {
          getItem: (k: string) => store[k] ?? null,
          setItem: (k: string, v: string) => {
            store[k] = v;
          },
          removeItem: (k: string) => {
            delete store[k];
          },
          clear: () => {
            store = {};
          },
        };
      })(),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("Registry renderiza children", () => {
    renderWithTheme(
      <StyledComponentsRegistry>
        <span data-testid="inner">dentro</span>
      </StyledComponentsRegistry>,
    );
    expect(screen.getByTestId("inner")).toHaveTextContent("dentro");
    expect(serverInsertedHtmlCallbacks.length).toBeGreaterThanOrEqual(1);
    const out = serverInsertedHtmlCallbacks[0]!();
    expect(out).toBeTruthy();
  });

  it("ClientLayout renderiza skip link e main", () => {
    renderWithTheme(
      <ClientLayout>
        <div data-testid="page">página</div>
      </ClientLayout>,
      { withToast: true },
    );
    expect(
      screen.getByRole("link", { name: /pular para o conteúdo/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("page")).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(
      screen.getByTestId("page"),
    );
  });

  it("BottomNav lista rotas", () => {
    mockUsePathname.mockReturnValue("/ameacas");
    renderWithTheme(<BottomNav />);
    expect(
      screen.getByRole("navigation", { name: /menu principal/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /ameaças/i }).length,
    ).toBeGreaterThan(0);
  });

  it("Header exibe título e barra de rolagem", async () => {
    renderWithTheme(<Header />, { withToast: true });
    expect(screen.getByRole("banner")).toBeInTheDocument();
    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText("ex: 4d8, 2d20+5");
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("QuickRollBar mostra dado não permitido e Enter rola", async () => {
    renderWithTheme(
      <>
        <QuickRollBar hintFloating />
        <RollToaster />
      </>,
      { withToast: true },
    );
    const input = screen.getByRole("textbox", { name: /fórmula de dados/i });
    fireEvent.change(input, { target: { value: "1d7" } });
    expect(screen.getByText(/d3, d4, d6/i)).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "2d6" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /rolagens recentes/i }),
      ).toBeInTheDocument();
    });
  });

  it("QuickRollBar rola fórmula válida", async () => {
    renderWithTheme(
      <>
        <QuickRollBar />
        <RollToaster />
      </>,
      { withToast: true },
    );
    const input = screen.getByRole("textbox", { name: /fórmula de dados/i });
    fireEvent.change(input, { target: { value: "2d6" } });
    const buttons = screen.getAllByRole("button", { name: /rolar dados/i });
    fireEvent.click(buttons[0]!);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /total \d+/i }),
      ).toBeInTheDocument();
    });
  });

  it("UpdateBanner Recarregar limpa caches, desregistra SW e chama location.reload", async () => {
    const unregister = vi.fn(() => Promise.resolve());
    const cacheDelete = vi.fn(() => Promise.resolve(true));
    vi.stubGlobal("caches", {
      keys: () => Promise.resolve(["workbox-a", "data-cache"]),
      delete: cacheDelete,
    } as CacheStorage);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ buildId: "nova" }),
        text: async () => "",
      })) as typeof fetch,
    );
    localStorage.setItem("app-version", "velha");
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    const sw = globalThis.navigator.serviceWorker as {
      getRegistration: ReturnType<typeof vi.fn>;
    };
    sw.getRegistration = vi.fn(() =>
      Promise.resolve({ unregister } as unknown as ServiceWorkerRegistration),
    );
    renderWithTheme(<UpdateBanner />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /recarregar/i }),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /recarregar/i }));
    await waitFor(() => {
      expect(cacheDelete).toHaveBeenCalled();
      expect(unregister).toHaveBeenCalled();
      expect(reload).toHaveBeenCalled();
    });
  });

  it("UpdateBanner ignora falha de fetch silenciosamente", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network"))) as typeof fetch,
    );
    renderWithTheme(<UpdateBanner />);
    await new Promise((r) => setTimeout(r, 80));
    expect(
      screen.queryByRole("dialog", { name: /atualização disponível/i }),
    ).not.toBeInTheDocument();
  });

  it("UpdateBanner pode aparecer quando buildId difere", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | Request) => {
        const u = typeof url === "string" ? url : url.url;
        if (String(u).includes("version.json")) {
          return {
            ok: true,
            json: async () => ({ buildId: "servidor-xyz" }),
            text: async () => "",
          };
        }
        return { ok: true, json: async () => ({}), text: async () => "" };
      }) as typeof fetch,
    );
    localStorage.setItem("app-version", "local-antigo");
    renderWithTheme(<UpdateBanner />);
    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: /recarregar/i }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
