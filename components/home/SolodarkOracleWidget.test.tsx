import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { SolodarkOracleWidget } from "@/components/home/SolodarkOracleWidget";
import RollToaster from "@/components/ui/RollToaster";
import { renderWithTheme } from "@/tests/utils/render-theme";
import * as tabelas from "@/lib/tabelas";
import type { RollTableData } from "@/lib/rollTable";

const oracleTable: RollTableData = {
  id: "solodark-oraculo",
  titulo: "Oráculo",
  categoria: "solodark",
  rolagem: "1d20",
  headers: ["d20", "Resposta"],
  rows: [["11-20", "Sim"]],
};

vi.mock("@/lib/tabelas", () => ({
  getTabelaById: vi.fn(),
}));

describe("SolodarkOracleWidget", () => {
  beforeEach(() => {
    vi.mocked(tabelas.getTabelaById).mockImplementation(async (id) => {
      if (id === "solodark-oraculo") return oracleTable;
      if (id === "algo-acontece") return null;
      return null;
    });
  });

  it("mostra resultado no toaster ao rolar", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    renderWithTheme(
      <>
        <SolodarkOracleWidget />
        <RollToaster />
      </>,
      { withToast: true },
    );

    const btn = await screen.findByRole("button", { name: /rolar oráculo/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /rolagens recentes/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Oráculo")).toBeInTheDocument();
    expect(screen.queryByText(/ResultBox/i)).not.toBeInTheDocument();
  });
});
