export type EncounterKind =
  | "criatura"
  | "armadilha"
  | "tesouro"
  | "item_magico"
  | "cena_evento"
  | "combinar";

export type TreasureBand = "0-3" | "4-6" | "7-9" | "10+";

export type EncounterClassification = {
  kind: EncounterKind;
  treasureBand?: TreasureBand;
};

export type EncounterFollowUp = {
  tableId: string;
  label: string;
};

const CREATURE_RE =
  /\d+d\d+|\(\s*\d+d\d+\s*\)|patrulha|esqueleto|goblin|goblins|rato|zumbi|demônio|demônios|vrock|aranha|orc|morcego|basilisco|naga|marilith|doppel|lich|cocatriz|oni|aprendizes arrogantes provocam uma briga/i;

const CENA_RE =
  /sala vazia|chuva ácida|cinzas incandescentes caem|pegadinha\)|runa \(pegadinha\)/i;

export function parseTreasureBand(texto: string): TreasureBand {
  const tabela = texto.match(
    /tabela de tesouros?\s*(\d+)\s*[-–]\s*(\d+)/i,
  );
  if (tabela) {
    const hi = parseInt(tabela[2], 10);
    return nvToBand(hi);
  }
  const nv = texto.match(/NV\s*(\d+)/i);
  if (nv) return nvToBand(parseInt(nv[1], 10));
  return "0-3";
}

export function nvToBand(nv: number): TreasureBand {
  if (nv <= 3) return "0-3";
  if (nv <= 6) return "4-6";
  if (nv <= 9) return "7-9";
  return "10+";
}

export function treasureTableId(band: TreasureBand): string {
  const ids: Record<TreasureBand, string> = {
    "0-3": "tesouros-0-3",
    "4-6": "tesouros-4-6",
    "7-9": "tesouros-7-9",
    "10+": "tesouros-10-mais",
  };
  return ids[band];
}

export function classifyEncounterResult(texto: string): EncounterClassification {
  const t = texto.trim();
  const lower = t.toLowerCase();

  if (/role dois encontros|combine os resultados/i.test(lower)) {
    return { kind: "combinar" };
  }
  if (/armadilha/i.test(lower)) {
    return { kind: "armadilha" };
  }
  if (
    /tesouro|baú de tesouro|tabela de tesouros|espólio/i.test(lower) &&
    !/item mágico aleatório/i.test(lower)
  ) {
    return { kind: "tesouro", treasureBand: parseTreasureBand(t) };
  }
  if (/item mágico aleatório|confia um item mágico aleatório/i.test(lower)) {
    return { kind: "item_magico" };
  }
  if (CENA_RE.test(lower)) {
    return { kind: "cena_evento" };
  }
  if (CREATURE_RE.test(lower)) {
    return { kind: "criatura" };
  }
  return { kind: "cena_evento" };
}

export function buildEncounterFollowUps(
  classification: EncounterClassification,
): EncounterFollowUp[] {
  switch (classification.kind) {
    case "criatura":
      return [
        { tableId: "distancia-inicial-encontro", label: "Distância inicial" },
        { tableId: "atividade-criaturas", label: "Atividade" },
      ];
    case "armadilha":
      return [{ tableId: "armadilhas", label: "Armadilha (d12)" }];
    case "tesouro": {
      const band = classification.treasureBand ?? "0-3";
      return [
        {
          tableId: treasureTableId(band),
          label: `Tesouro ${band} (d100)`,
        },
      ];
    }
    case "item_magico":
      return [
        {
          tableId: "itens-magicos-aleatorios",
          label: "Item mágico aleatório",
        },
      ];
    case "combinar":
    case "cena_evento":
      return [];
  }
}
