import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./utils/render-theme";
import Home from "@/app/page";
import AmeacasPage from "@/app/ameacas/page";
import ArcanosHubPage from "@/app/arcanos/page";
import ArcanosItensPage from "@/app/arcanos/itens/page";
import GrimorioPage from "@/app/arcanos/grimorio/page";
import { MagiaDetailClient } from "@/app/arcanos/grimorio/[id]/MagiaDetailClient";
import RegrasPage from "@/app/regras/page";
import RegrasAntecedentesPage from "@/app/regras/antecedentes/page";
import RegrasTabelasPage from "@/app/regras/tabelas/page";
import RegrasGlossarioPage from "@/app/regras/glossario/page";
import { AmeacaDetailClient } from "@/app/ameacas/[id]/AmeacaDetailClient";
import { RegrasSectionClient } from "@/app/regras/[sectionId]/RegrasSectionClient";
import { clearEscudoCache } from "@/lib/escudo";
import { clearAmeacasTokensCache } from "@/lib/ameacasTokens";
import { clearAmeacasCache } from "@/lib/ameacas";
import { escudoFixture } from "./fixtures/escudo-data";
import { ameacasFixture, ameacaMinimal } from "./fixtures/ameacas-data";
import React from "react";

function stubFetchJson(data: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      // Evita que getTabelaById trate o fixture do Escudo como tabela.
      if (url.includes("/data/tabelas/") && !url.includes("tabelas-index")) {
        return {
          ok: false,
          json: async () => ({}),
          text: async () => "",
        };
      }
      if (url.includes("ameacas-tokens.json")) {
        return {
          ok: true,
          json: async () => ({ tokens: {} }),
          text: async () => "",
        };
      }
      return {
        ok: true,
        json: async () => data,
        text: async () => "",
      };
    }) as typeof fetch,
  );
}

/** Evita flakes quando a suíte roda em paralelo (CPU lenta / muitos workers). */
const asyncPageTimeout = 15_000;

describe("páginas client", () => {
  beforeEach(() => {
    clearEscudoCache();
    clearAmeacasCache();
    clearAmeacasTokensCache();
  });

  it("Home renderiza oráculo SoloDark, regras em uso e licença", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("algo-acontece.json")) {
          return {
            ok: true,
            json: async () => ({
              id: "algo-acontece",
              titulo: "Algo acontece",
              categoria: "aventura",
              rolagem: "d100",
              headers: ["d100", "Evento"],
              rows: [["1", "Um lobo aparece"]],
            }),
          };
        }
        if (url.includes("solodark-oraculo.json")) {
          return {
            ok: true,
            json: async () => ({
              id: "solodark-oraculo",
              titulo: "Oráculo — sim/não",
              categoria: "solodark",
              rolagem: "d20",
              headers: ["d20", "Resposta"],
              rows: [
                ["1–9", "Não"],
                ["10", "Reviravolta"],
                ["11–20", "Sim"],
              ],
            }),
          };
        }
        return { ok: false, json: async () => ({}) };
      }) as typeof fetch,
    );
    renderWithTheme(<Home />, { withToast: true });
    expect(
      screen.getByRole("heading", { name: /oráculo \(d20\)/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/e complica/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /rolar oráculo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /tabela sim\/não/i }),
    ).toHaveAttribute("href", "/regras/tabelas#tabela-solodark-oraculo");
    expect(
      screen.getByRole("heading", { name: /regras em uso/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_content, el) =>
          el?.tagName.toLowerCase() === "p" &&
          !!el.textContent?.includes("feito de fã para fã"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /shadowdark mastershield/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /faq da third-party license shadowdark/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /you see this/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /astraldark.*pdf/i }),
    ).toHaveAttribute("href", expect.stringContaining("Astraldark%20pt-BR.pdf"));
  });

  it(
    "Ameaças lista após carregar dados",
    async () => {
      stubFetchJson(ameacasFixture);
      renderWithTheme(<AmeacasPage />);
      await waitFor(
        () => {
          expect(
            screen.getByText(ameacaMinimal.nome.toLocaleUpperCase("pt-BR")),
          ).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
    },
    asyncPageTimeout,
  );

  it("Arcanos hub mostra atalhos itens e grimório", () => {
    renderWithTheme(<ArcanosHubPage />);
    expect(screen.getByRole("heading", { name: /arcanos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /itens mágicos/i })).toHaveAttribute(
      "href",
      "/arcanos/itens",
    );
    expect(screen.getByRole("link", { name: /grimório de magias/i })).toHaveAttribute(
      "href",
      "/arcanos/grimorio",
    );
  });

  it("Arcanos itens renderiza catálogo e link ao gerador", async () => {
    stubFetchJson({ itens: [{ nome: "Poção de cura", descricao: "Restaura PV." }] });
    renderWithTheme(<ArcanosItensPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /itens mágicos/i })).toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: /sortear item mágico/i }),
    ).toHaveAttribute("href", "/geradores/itens-magicos-aleatorios");
  });

  it("Grimório lista magias após carregar", async () => {
    stubFetchJson({
      magias: [
        {
          id: "alarme",
          nome: "ALARME",
          descricao: "Duração: 1 dia\n\nVocê toca um objeto…",
          origem: "livro",
          listas: ["sacerdote"],
          grau: { sacerdote: 1 },
        },
        {
          id: "bola-de-fogo",
          nome: "BOLA DE FOGO",
          descricao: "Explosão.",
          origem: "livro",
          listas: ["mago"],
          grau: { mago: 3 },
        },
      ],
    });
    renderWithTheme(<GrimorioPage />);
    await waitFor(() => {
      expect(screen.getByText("ALARME")).toBeInTheDocument();
    });
    expect(screen.getByText(/Sacerdote 1 · Livro de Regras/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /nome \(a → z\)/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /^classe$/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /^grau$/i })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: /^grau$/i }),
      { target: { value: "1" } },
    );
    expect(screen.getByText("ALARME")).toBeInTheDocument();
    expect(screen.queryByText("BOLA DE FOGO")).not.toBeInTheDocument();
  });

  it("MagiaDetailClient mostra corpo da magia", async () => {
    stubFetchJson({
      magias: [
        {
          id: "alarme",
          nome: "ALARME",
          descricao:
            "Duração: 1 dia\n\nVocê toca um objeto, como o limiar de uma porta, e insere um alarme mágico nele.",
          origem: "livro",
          listas: ["sacerdote"],
          grau: { sacerdote: 1 },
        },
      ],
    });
    renderWithTheme(<MagiaDetailClient id="alarme" />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "ALARME" })).toBeInTheDocument();
    });
    expect(screen.getByText(/Sacerdote 1/)).toBeInTheDocument();
    expect(screen.getByText(/Livro de Regras/)).toBeInTheDocument();
    expect(screen.queryByText(/Lista:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Você toca um objeto/i)).toBeInTheDocument();
  });

  it(
    "Regras índice após carregar escudo",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasPage />);
      await waitFor(
        () => {
          expect(screen.getByText(/§ 1 — Mecânica/)).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
      expect(
        screen.getByRole("link", { name: "Antecedentes" }),
      ).toHaveAttribute("href", "/regras/antecedentes");
    },
    asyncPageTimeout,
  );

  it(
    "Antecedentes lista secções na mesma página",
    async () => {
      stubFetchJson({
        entradas: [
          {
            id: "livro-moleque",
            nome: "Moleque",
            descricao: "Você cresceu nas ruas.",
            fonte: "livro",
            lista: "Livro de Regras (d20)",
            rolagem: "d20",
            numero: 1,
          },
        ],
      });
      renderWithTheme(<RegrasAntecedentesPage />);
      await waitFor(
        () => {
          expect(
            screen.getByRole("heading", { name: "Antecedentes" }),
          ).toBeInTheDocument();
          expect(
            screen.getByRole("heading", { name: "Livro de Regras" }),
          ).toBeInTheDocument();
          expect(screen.getByText(/Moleque/)).toBeInTheDocument();
          expect(screen.getByText(/Você cresceu nas ruas/)).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
    },
    asyncPageTimeout,
  );

  it(
    "Regras tabelas após carregar",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasTabelasPage />);
      await waitFor(
        () => {
          expect(
            screen.getByRole("heading", { name: "Tabelas" }),
          ).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
    },
    asyncPageTimeout,
  );

  it(
    "Glossário após carregar",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasGlossarioPage />);
      await waitFor(
        () => {
          expect(
            screen.getByRole("heading", { name: "Glossário" }),
          ).toBeInTheDocument();
          expect(screen.getByText("AGI")).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
    },
    asyncPageTimeout,
  );

  it(
    "AmeacaDetailClient mostra ficha quando id existe",
    async () => {
      stubFetchJson(ameacasFixture);
      renderWithTheme(<AmeacaDetailClient id="teste-ameaca" />, {
        withToast: true,
      });
      await waitFor(
        () => {
          expect(
            screen.getByRole("heading", { name: ameacaMinimal.nome }),
          ).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
    },
    asyncPageTimeout,
  );

  it(
    "AmeacaDetailClient mostra não encontrada",
    async () => {
      stubFetchJson(ameacasFixture);
      renderWithTheme(<AmeacaDetailClient id="inexistente" />, {
        withToast: true,
      });
      await waitFor(
        () => {
          expect(
            screen.getByText(/Ameaça não encontrada/i),
          ).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
    },
    asyncPageTimeout,
  );

  it(
    "RegrasSectionClient renderiza seção",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasSectionClient sectionId="1" />);
      await waitFor(
        () => {
          expect(screen.getByText(/Mecânica básica/i)).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
    },
    asyncPageTimeout,
  );

  it(
    "RegrasSectionClient lista fórmulas e abre tabela no acordeão",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasSectionClient sectionId="1" />);
      await waitFor(
        () => {
          expect(screen.getByText("1d20+5")).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
      expect(screen.getByText(/Ref quebrada/i)).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.getAllByRole("button", { name: /ver tabela/i }).length,
        ).toBeGreaterThan(0);
      });
      fireEvent.click(
        screen.getAllByRole("button", { name: /ver tabela/i })[0],
      );
      expect(screen.getAllByRole("table").length).toBeGreaterThan(0);
    },
    asyncPageTimeout,
  );

  it(
    "RegrasSectionClient mostra Distâncias e Testes e CDs abertas sem acordeão",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasSectionClient sectionId="1" />);
      await waitFor(
        () => {
          expect(screen.getByText("Distâncias")).toBeInTheDocument();
          expect(screen.getByText("Testes e CDs")).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
      // ResponsiveTable pode esconder <table> via media query no jsdom.
      expect(
        screen.getAllByRole("table", { hidden: true }).length,
      ).toBeGreaterThanOrEqual(2);
      // Ainda há acordeão para outras tabelas da secção (ex.: Termos).
      expect(
        screen.getAllByRole("button", { name: /ver tabela/i }).length,
      ).toBeGreaterThanOrEqual(1);
    },
    asyncPageTimeout,
  );

  it(
    "RegrasSectionClient mostra tabelas de Exploração abertas sem acordeão",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasSectionClient sectionId="2" />);
      await waitFor(
        () => {
          expect(screen.getByText("Perigo")).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
      expect(
        screen.getAllByRole("table", { hidden: true }).length,
      ).toBeGreaterThanOrEqual(2);
      expect(
        screen.queryByRole("button", { name: /ver tabela/i }),
      ).not.toBeInTheDocument();
    },
    asyncPageTimeout,
  );

  it(
    "RegrasSectionClient Magia liga falhas críticas às tabelas",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasSectionClient sectionId="4" />);
      await waitFor(
        () => {
          expect(screen.getByText("Falhas críticas")).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
      expect(
        screen.getByRole("link", { name: /falha mágica — mago, graus 1–2/i }),
      ).toHaveAttribute(
        "href",
        "/regras/tabelas#tabela-falha-magica-mago-1-2",
      );
      expect(
        screen.getByRole("link", { name: /falhas diabólicas, graus 1–3/i }),
      ).toHaveAttribute(
        "href",
        "/regras/tabelas#tabela-falha-magica-diabolica-1-3",
      );
      expect(
        screen.queryByRole("button", { name: /ver tabela/i }),
      ).not.toBeInTheDocument();
    },
    asyncPageTimeout,
  );

  it(
    "RegrasSectionClient mostra tabela de MJ e progressão aberta sem acordeão",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasSectionClient sectionId="6" />);
      await waitFor(
        () => {
          expect(screen.getByText("XP e tesouro")).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
      expect(
        screen.getAllByRole("table", { hidden: true }).length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.queryByRole("button", { name: /ver tabela/i }),
      ).not.toBeInTheDocument();
    },
    asyncPageTimeout,
  );

  it(
    "RegrasSectionClient seção inexistente",
    async () => {
      stubFetchJson(escudoFixture);
      renderWithTheme(<RegrasSectionClient sectionId="999" />);
      await waitFor(
        () => {
          expect(screen.getByText(/Seção não encontrada/i)).toBeInTheDocument();
        },
        { timeout: asyncPageTimeout },
      );
    },
    asyncPageTimeout,
  );
});
