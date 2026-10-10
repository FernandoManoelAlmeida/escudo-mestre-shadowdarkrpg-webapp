/**
 * Resumo das regras em uso no PWA (compêndio Fantasia / Mundo Fraturado).
 * Fonte: Referências/shadowdark/Escudo do Mestre Shadowdark.md
 */
export interface RegraCasaItem {
  titulo: string;
  descricao: string;
  referencia?: string;
}

export const REGRAS_CASA_RESUMO: RegraCasaItem[] = [
  {
    titulo: "Testes e CDs",
    referencia: "§ 1.1",
    descricao:
      "d20 + MOD ≥ CD. Vantagem: 2×, melhor. Desvantagem: 2×, pior. CDs típicas: 9 fácil, 12 normal, 15 difícil, 18 extrema.",
  },
  {
    titulo: "Luz e exploração",
    referencia: "§ 2.1",
    descricao:
      "Tocha: 1 h de tempo real. Fora da luz = escuridão (desvantagem visual; teste de encontro por rodada).",
  },
  {
    titulo: "Encontro aleatório",
    referencia: "§ 2.2",
    descricao: "d6: 1 = encontro nas rodadas de exploração. Tabela encontro_d6 no Escudo.",
  },
  {
    titulo: "Combate",
    referencia: "§ 3",
    descricao:
      "Ataque: d20 + MOD (FOR melee, DES ranged) ≥ CA. Crítico em 20 natural (dobra dados de dano). Iniciativa: d20 + DES.",
  },
  {
    titulo: "Navegação astral (mesa)",
    referencia: "§ 5.1",
    descricao:
      "Envelope de ar, gravidade plana no casco, elmo para pilotar. Combate naval com distâncias Perto/Longe entre naves.",
  },
];
