import type { AmeacasData, Criatura } from "@/lib/ameacas";

export const ameacaMinimal: Criatura = {
  id: "teste-ameaca",
  nome: "Criatura Teste",
  nv: 1,
  al: "N",
  ca: 12,
  pv: 5,
  atq: "1 mordida +1 (1d4)",
  mv: "Perto",
  atributos: { F: 0, D: 1, C: 0, I: 0, S: 0, Car: 0 },
  tracos: [{ nome: "Teste", descricao: "Traço de exemplo." }],
  origem: "homebrew",
};

export const ameacasFixture: AmeacasData = {
  ameacas: [ameacaMinimal],
};
