/**
 * Classificação de cadeia por linha de encontro (canónico para migrate + vault apply).
 * Valores de célula «Cadeia»: cena | criatura | armadilha | tesouro | item | combinar
 */

const URBAN_TABLE_IDS = new Set([
  "encontro-distrito-alto",
  "encontro-distrito-artesao",
  "encontro-distrito-baixo",
  "encontro-distrito-comercial",
  "encontro-distrito-do-castelo",
  "encontro-distrito-religioso",
  "encontro-distrito-universitario",
  "encontro-tavernas",
]);

const CADEIA_TOKENS = new Set([
  "cena",
  "criatura",
  "armadilha",
  "tesouro",
  "item",
  "combinar",
]);

function normalizeCadeiaCell(cell) {
  if (!cell?.trim()) return null;
  const v = cell.trim().toLowerCase();
  if (v === "cena_evento" || v === "cena") return "cena";
  if (v === "item_magico" || v === "item") return "item";
  return CADEIA_TOKENS.has(v) ? v : null;
}

function classifyMechanical(texto) {
  const lower = texto.trim().toLowerCase();
  if (/role dois encontros|combine os resultados/i.test(lower)) return "combinar";
  if (/item mágico aleatório|confia um item mágico aleatório/i.test(lower)) {
    return "item";
  }
  if (
    /tesouro|baú de tesouro|tabela de tesouros|espólio/i.test(lower) &&
    !/item mágico aleatório/i.test(lower)
  ) {
    return "tesouro";
  }
  if (
    /\barmadilha\b/i.test(lower) ||
    /fio de armadilha|rede larga e oculta|pegadinha\)|runa \(pegadinha\)/i.test(
      lower,
    )
  ) {
    if (/armadilha de dardos|fio de armadilha|rede larga|sond/i.test(lower)) {
      return "armadilha";
    }
    if (/\barmadilha\b/i.test(lower) && !/sem armadilha/i.test(lower)) {
      return "armadilha";
    }
  }
  return null;
}

const CENA_WILDERNESS_RE =
  /exploradores rivais|trocar mercadorias|mercador errante|abrigo seguro|capela de pedra abandonada|capela.*abrigo|sala vazia|chuva ácida|cinzas incandescentes caem|rosas carmesim brotam|estátua desgastada|leprechaun presunçoso insulta|discursa ferozmente para 2d\d+ orcs|unicórnio cintilante|árvore antiga e podre se quebra|cabeça de pedra meio enterrada|dríade encara um poço|insulta os pjs de um galho/i;

const CENA_DICE_RE =
  /rivais feridos e amarrados|berserks se dispõe a trocar|cura 1d4|1d4 exploradores rivais|plebeus bêbados|aprendizes|mendigos|clientes saem depressa|zumbis preservados integrados|filhote de mamute foge|manada de 2d6 mamutes debandam/i;

function classifyWildernessRow(texto) {
  const mech = classifyMechanical(texto);
  if (mech) return mech;

  const lower = texto.toLowerCase();
  if (CENA_WILDERNESS_RE.test(lower)) return "cena";
  if (CENA_DICE_RE.test(lower)) return "cena";

  if (/monte cambaleante/i.test(lower)) return "criatura";

  if (/\d+d\d+|\(\s*\d+d\d+\s*\)/.test(lower)) {
    if (
      /patrulha|esqueleto|goblin|zumbi|orc|urso|lobo|morcego|aranha|demônio|troll|ogro|naga|basilisco|lich|vampir|elemental|otyugh|centopeia|enxame/i.test(
        lower,
      )
    ) {
      return "criatura";
    }
  }

  if (
    /faminto|avançam contra|flanqueiam|esconde em uma pilha|irrascível|hostil|furioso|se contorce para fora/i.test(
      lower,
    ) &&
    /otyugh|urso|orc|troll|ogro|dragão|naga|basilisco|enxame|centopeia|morcego|aranha|zumbi|esqueleto|goblin|demônio|vampir|kraken|elemental|wyrm|hydra|grifo/i.test(
      lower,
    )
  ) {
    return "criatura";
  }

  if (/dragão da floresta irritável/i.test(lower)) return "criatura";

  if (
    /um (ogro|troll|dragão|lich|vampiro|kraken|basilisco|wyvern|grifo|unicórnio)/i.test(
      texto,
    ) &&
    !/oferece|convida|surge sob um raio/i.test(lower)
  ) {
    if (/unicórnio cintilante/i.test(lower)) return "cena";
  }

  if (/tentativamente|tenta arrancar|arrasta 1d4/i.test(lower)) {
    if (/troll|ogro/i.test(lower) && /exploradores rivais/i.test(lower)) {
      return "cena";
    }
    if (/tenta arrancar/i.test(lower)) return "criatura";
  }

  return "cena";
}

function classifyPeriferiaRow(texto) {
  const mech = classifyMechanical(texto);
  if (mech) return mech;

  const lower = texto.toLowerCase();
  if (
    /oferece abrigo|vendedor ambulante|ratos crocantes|velha corcunda|mago sombrio e 1d4 aprendizes conduzem um plebeu/i.test(
      lower,
    )
  ) {
    return "cena";
  }
  if (/filhote de mamute foge|matilha de 2d6 lobos|manada de 2d6 mamutes|orc solitário/i.test(lower)) {
    return "criatura";
  }
  return classifyWildernessRow(texto);
}

function inferCadeiaForRow(tableId, texto) {
  const mech = classifyMechanical(texto);
  if (mech) return mech;

  if (URBAN_TABLE_IDS.has(tableId)) return "cena";

  if (tableId === "encontro-periferia") return classifyPeriferiaRow(texto);

  return classifyWildernessRow(texto);
}

function cadeiaToFollowUpKind(cadeia) {
  switch (cadeia) {
    case "cena":
      return "cena_evento";
    case "criatura":
      return "criatura";
    case "armadilha":
      return "armadilha";
    case "tesouro":
      return "tesouro";
    case "item":
      return "item_magico";
    case "combinar":
      return "combinar";
    default:
      return "cena_evento";
  }
}

function defaultCadeiaForTable(tableId) {
  if (URBAN_TABLE_IDS.has(tableId)) return "cena";
  return null;
}

module.exports = {
  URBAN_TABLE_IDS,
  CADEIA_TOKENS,
  normalizeCadeiaCell,
  inferCadeiaForRow,
  cadeiaToFollowUpKind,
  defaultCadeiaForTable,
};
