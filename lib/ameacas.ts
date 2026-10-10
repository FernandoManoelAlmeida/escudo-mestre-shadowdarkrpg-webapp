export type OrigemCriatura = "oficial" | "homebrew";

export type CriaturaAtributos = {
  F: number;
  D: number;
  C: number;
  I: number;
  S: number;
  Car: number;
};

export type CriaturaTraco = {
  nome: string;
  descricao: string;
};

export type Criatura = {
  id: string;
  nome: string;
  epitet?: string;
  flavor?: string;
  tipo?: string;
  nv: number;
  al: string;
  ca: number;
  pv: number;
  atq: string;
  mv: string;
  atributos: CriaturaAtributos;
  tracos: CriaturaTraco[];
  fonte?: string;
  tags?: string[];
  origem: OrigemCriatura;
};

export type AmeacasData = {
  ameacas: Criatura[];
};

export type OrdenarAmeacasPor = "nome" | "nv";
export type OrdenarSentido = "asc" | "desc";

export type FiltrosAmeacas = {
  texto?: string;
  ordenarPor?: OrdenarAmeacasPor;
  ordenarSentido?: OrdenarSentido;
  origem?: OrigemCriatura | "todas";
  nvMin?: number;
  nvMax?: number;
  al?: string;
  tipo?: string;
};

const AMEACAS_URL =
  (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/data/ameacas.json";

let cached: AmeacasData | null = null;

export async function getAmeacas(): Promise<AmeacasData> {
  if (cached) return cached;
  const res = await fetch(AMEACAS_URL);
  if (!res.ok) throw new Error("Falha ao carregar ameaças");
  cached = (await res.json()) as AmeacasData;
  return cached;
}

export function getAmeacaById(
  data: AmeacasData,
  id: string,
): Criatura | undefined {
  return data.ameacas.find((a) => a.id === id);
}

function tipoIndiceOuLixo(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (/índice por nv/i.test(t)) return true;
  if (/\[\[#/.test(t)) return true;
  return false;
}

/** Tipo curto na listagem do bestiário (homebrew: só categoria antes de «..»). */
export function tipoParaListagem(c: Criatura): string | undefined {
  const raw = c.tipo?.trim();
  if (!raw) return undefined;
  if (c.origem !== "homebrew") return raw;

  const short = raw.split("..")[0]?.trim().replace(/\.$/, "") ?? "";
  if (tipoIndiceOuLixo(short)) return undefined;
  return short;
}

function textoParaBusca(a: Criatura): string {
  const partes: string[] = [
    a.id,
    a.nome,
    a.epitet ?? "",
    a.flavor ?? "",
    a.tipo ?? "",
    String(a.nv),
    a.al,
    a.atq,
    a.mv,
    a.fonte ?? "",
    ...(a.tags ?? []),
  ];
  (a.tracos ?? []).forEach((t) => {
    partes.push(t.nome, t.descricao);
  });
  return partes.filter(Boolean).join(" ").toLowerCase();
}

export function getTiposParaFiltro(data: AmeacasData): string[] {
  const set = new Set<string>();
  for (const a of data.ameacas) {
    if (a.tipo) set.add(a.tipo.split("(")[0].trim());
  }
  return Array.from(set).sort((x, y) => x.localeCompare(y, "pt-BR"));
}

export function filterAmeacas(
  data: AmeacasData,
  filters: FiltrosAmeacas,
): Criatura[] {
  let list = [...data.ameacas];

  const q = filters.texto?.trim();
  if (q) {
    const busca = q.toLowerCase();
    list = list.filter((a) => textoParaBusca(a).includes(busca));
  }

  if (filters.origem && filters.origem !== "todas") {
    list = list.filter((a) => a.origem === filters.origem);
  }

  if (filters.al) {
    list = list.filter((a) => a.al === filters.al);
  }

  if (filters.tipo) {
    list = list.filter((a) =>
      (a.tipo ?? "").toLowerCase().includes(filters.tipo!.toLowerCase()),
    );
  }

  if (filters.nvMin != null) {
    list = list.filter((a) => a.nv >= filters.nvMin!);
  }
  if (filters.nvMax != null) {
    list = list.filter((a) => a.nv <= filters.nvMax!);
  }

  const ordenarPor = filters.ordenarPor ?? "nome";
  const ordenarSentido = filters.ordenarSentido ?? "asc";

  list.sort((a, b) => {
    if (ordenarPor === "nome") {
      const cmp = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
      return ordenarSentido === "asc" ? cmp : -cmp;
    }
    const cmp = a.nv - b.nv;
    return ordenarSentido === "asc" ? cmp : -cmp;
  });

  return list;
}

/** @deprecated alias para compatibilidade de imports antigos */
export type Ameaca = Criatura;
