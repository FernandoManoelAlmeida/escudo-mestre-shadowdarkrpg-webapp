import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import RollToaster from "@/components/ui/RollToaster";
import { useRollToast } from "@/context/RollToastContext";
import { renderWithTheme } from "./utils/render-theme";
import type { RollResult } from "@/lib/dice";

const baseRoll: RollResult = {
  formula: "1d20",
  rolls: [12],
  modifier: 0,
  total: 12,
  display: "[12] = 12",
};

function SeedToaster({
  items,
}: {
  items: Array<{ result: RollResult; label?: string; suffix?: string }>;
}) {
  const { addRoll } = useRollToast();
  useEffect(() => {
    items.forEach(({ result, label, suffix }) => {
      addRoll(result, { label, suffix });
    });
  }, [items, addRoll]);
  return <RollToaster />;
}

describe("RollToaster", () => {
  const origMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = origMatchMedia;
  });

  it("não renderiza região quando não há rolagens", () => {
    renderWithTheme(<RollToaster />, { withToast: true });
    expect(
      screen.queryByRole("region", { name: /rolagens recentes/i }),
    ).not.toBeInTheDocument();
  });

  it("mostra total e remove ao clicar", async () => {
    renderWithTheme(<SeedToaster items={[{ result: baseRoll }]} />, {
      withToast: true,
    });
    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /rolagens recentes/i }),
      ).toBeInTheDocument();
    });
    const btn = screen.getByRole("button", { name: /total 12/i });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /rolagens recentes/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("com duas rolagens exibe Limpar tudo e limpa", async () => {
    renderWithTheme(
      <SeedToaster
        items={[
          { result: { ...baseRoll, total: 3, rolls: [3], display: "x" } },
          { result: { ...baseRoll, total: 7, rolls: [7], display: "y" } },
        ]}
      />,
      { withToast: true },
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /limpar tudo/i }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /limpar tudo/i }));
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /rolagens recentes/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("Escape remove a rolagem mais recente", async () => {
    /* addRoll faz prepend: último item do seed é o mais novo na lista. */
    renderWithTheme(
      <SeedToaster
        items={[
          { result: { ...baseRoll, total: 1, rolls: [1], display: "b" } },
          { result: { ...baseRoll, total: 9, rolls: [9], display: "a" } },
        ]}
      />,
      { withToast: true },
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /total 9/i }),
      ).toBeInTheDocument(),
    );
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /total 9/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /total 1/i }),
      ).toBeInTheDocument();
    });
  });

  it("Espaço no cartão dispensa", async () => {
    renderWithTheme(<SeedToaster items={[{ result: baseRoll }]} />, {
      withToast: true,
    });
    const card = await screen.findByRole("button", { name: /total 12/i });
    fireEvent.keyDown(card, { key: " " });
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /rolagens recentes/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("Enter no cartão dispensa", async () => {
    renderWithTheme(<SeedToaster items={[{ result: baseRoll }]} />, {
      withToast: true,
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /total 12/i }),
      ).toBeInTheDocument();
    });
    const card = screen.getByRole("button", { name: /total 12/i });
    fireEvent.keyDown(card, { key: "Enter" });
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /rolagens recentes/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("swipe horizontal dispensa o toast", async () => {
    renderWithTheme(<SeedToaster items={[{ result: baseRoll }]} />, {
      withToast: true,
    });
    const card = await screen.findByRole("button", { name: /total 12/i });
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 0 } as Touch],
    });
    fireEvent.touchEnd(card, {
      changedTouches: [{ clientX: 200, clientY: 0 } as Touch],
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /rolagens recentes/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("destaca d20 escolhido e sufixo no detalhe", async () => {
    const withChosen: RollResult = {
      formula: "2d20",
      rolls: [4, 18],
      modifier: 2,
      total: 20,
      display: "hint",
      chosenD20: 18,
    };
    renderWithTheme(
      <SeedToaster
        items={[{ result: withChosen, label: "Teste", suffix: "vs DT" }]}
      />,
      { withToast: true },
    );
    await waitFor(() => {
      expect(screen.getByText("Teste")).toBeInTheDocument();
      expect(screen.getByText("18")).toBeInTheDocument();
      expect(screen.getByText(/vs DT/)).toBeInTheDocument();
    });
  });

  it("detalhe com chosenD20 e total diferente mostra ajuste no modificador", async () => {
    const r: RollResult = {
      formula: "2d20-2",
      rolls: [5, 14],
      modifier: -2,
      total: 12,
      display: "x",
      chosenD20: 14,
    };
    renderWithTheme(<SeedToaster items={[{ result: r }]} />, {
      withToast: true,
    });
    await waitFor(() => {
      expect(screen.getByText(/-2/)).toBeInTheDocument();
      expect(screen.getByText(/= 12/)).toBeInTheDocument();
    });
  });

  it("modificador zero quando total igual ao chosenD20 não mostra +0", async () => {
    const r: RollResult = {
      formula: "2d20",
      rolls: [10, 15],
      modifier: 0,
      total: 15,
      display: "x",
      chosenD20: 15,
    };
    renderWithTheme(<SeedToaster items={[{ result: r }]} />, {
      withToast: true,
    });
    await waitFor(() => {
      expect(screen.getByText(/= 15/)).toBeInTheDocument();
    });
  });

  it("com matchMedia tablet o efeito de scroll não impede o toaster", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: String(query).includes("768"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia;

    renderWithTheme(<SeedToaster items={[{ result: baseRoll }]} />, {
      withToast: true,
    });
    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: /rolagens recentes/i }),
      ).toBeInTheDocument(),
    );
  });
});
