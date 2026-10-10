import type { EscudoData } from "@/lib/escudo";

export const escudoFixture: EscudoData = {
  meta: {
    title: "Escudo Teste",
    description: "Desc",
    sources: ["Livro base"],
  },
  index: [
    { id: "1", title: "Mecânica", anchor: "1-mecanica" },
    { id: "2", title: "Criação", anchor: "2-criacao" },
  ],
  sections: [
    {
      id: "1",
      title: "Mecânica básica",
      subsections: [
        {
          id: "1.1",
          title: "Testes",
          content: "Role 1d20.",
          formulas: ["1d20+5", "2d6"],
        },
        { id: "1.2", title: "Termos", tableRef: "termos_importantes" },
        {
          id: "1.3",
          title: "Ref quebrada",
          content: "Texto.",
          tableRef: "tabela_inexistente",
        },
      ],
    },
    {
      id: "2",
      title: "Criação de personagem",
      subsections: [
        { id: "2.1", title: "Passo a passo", content: "Conceito, atributos." },
      ],
    },
  ],
  tables: {
    termos_importantes: {
      headers: ["Termo", "Significado"],
      rows: [
        { termo: "PV", significado: "Pontos de Vida" },
        { termo: "PD", significado: "Pontos de Determinação" },
      ],
    },
  },
  glossary: [
    {
      term: "AGI",
      fullName: "Agilidade",
      description: "Coordenação e reflexos.",
    },
  ],
};
