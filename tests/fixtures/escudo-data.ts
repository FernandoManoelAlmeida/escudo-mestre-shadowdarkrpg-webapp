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
    { id: "4", title: "Magia", anchor: "4-magia" },
    { id: "6", title: "MJ e progressão", anchor: "6-mj-e-progressao" },
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
        { id: "1.4", title: "Distâncias", tableRef: "distancias" },
        { id: "1.5", title: "Testes e CDs", tableRef: "testes_e_cds" },
      ],
    },
    {
      id: "2",
      title: "Criação de personagem",
      subsections: [
        { id: "2.1", title: "Passo a passo", content: "Conceito, atributos." },
        { id: "2.2", title: "Encontro", tableRef: "teste-encontro" },
        { id: "2.3", title: "Perigo", tableRef: "nivel-perigo" },
      ],
    },
    {
      id: "4",
      title: "Magia",
      subsections: [
        {
          id: "4.1",
          title: "Conjuração",
          content: "Teste de conjuração. Falha crítica — ver § 4.3.",
        },
        {
          id: "4.3",
          title: "Falhas críticas",
          content:
            "- Graus 1–2: [Falha mágica — mago, graus 1–2](/regras/tabelas#tabela-falha-magica-mago-1-2)\n- Bruxa: [Falhas diabólicas, graus 1–3](/regras/tabelas#tabela-falha-magica-diabolica-1-3)",
        },
      ],
    },
    {
      id: "6",
      title: "MJ e progressão",
      subsections: [
        {
          id: "6.2",
          title: "XP e tesouro",
          content: "XP pela qualidade.",
          tableRef: "xp-tesouro",
        },
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
    distancias: {
      headers: ["Distância", "Alcance"],
      rows: [
        { distancia: "Adjacente", alcance: "1,5 m" },
        { distancia: "Perto", alcance: "até 9 m" },
      ],
    },
    testes_e_cds: {
      headers: ["CD", "Dificuldade"],
      rows: [
        { cd: "9", dificuldade: "Fácil" },
        { cd: "12", dificuldade: "Normal" },
      ],
    },
    "teste-encontro": {
      headers: ["d6", "Resultado"],
      rows: [{ d6: "1", resultado: "Encontro" }],
    },
    "nivel-perigo": {
      headers: ["Nível", "Frequência"],
      rows: [{ nivel: "Inseguro", frequencia: "3" }],
    },
    "xp-tesouro": {
      headers: ["Qualidade", "XP"],
      rows: [{ qualidade: "Comum", xp: "1" }],
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
