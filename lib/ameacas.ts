import { keepAmeacaForCopyrightFree } from "@/lib/copyrightFreeFilter";
import { mapCriaturaNomenclature } from "@/lib/githNomenclature";

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

/** Nome na listagem do bestiário (caixa alta, alinhado ao livro). */
export function ameacaDisplayNome(nome: string): string {
  return nome.toLocaleUpperCase("pt-BR");
}

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
  const raw = (await res.json()) as AmeacasData;
  cached = {
    ameacas: raw.ameacas
      .filter((a) => keepAmeacaForCopyrightFree(a))
      .map(mapCriaturaNomenclature),
  };
  return cached;
}

export function getAmeacaById(
  data: AmeacasData,
  id: string,
): Criatura | undefined {
  return data.ameacas.find((a) => a.id === id);
}

/** Limpa cache (testes). */
export function clearAmeacasCache(): void {
  cached = null;
}

function tipoIndiceOuLixo(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (/índice por nv/i.test(t)) return true;
  if (/\[\[#/.test(t)) return true;
  return false;
}

/** Tipo na listagem — igual ao livro base: só verbetes oficiais com tipo curto no JSON. */
export function tipoParaListagem(c: Criatura): string | undefined {
  if (c.origem === "homebrew") return undefined;
  const raw = c.tipo?.trim();
  if (!raw) return undefined;
  if (tipoIndiceOuLixo(raw)) return undefined;
  return raw;
}

function normalizarChaveNome(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Fonte na ficha — homebrew não mostra (evita título de documento, ex. «Matriprole Matrímpio»). */
export function fonteParaFicha(c: Criatura): string | undefined {
  if (c.origem === "homebrew") return undefined;
  const fonte = c.fonte?.trim();
  if (!fonte) return undefined;
  if (/^besti[aá]rio$/i.test(fonte)) return undefined;
  const chaveFonte = normalizarChaveNome(fonte);
  const nomePrincipal = normalizarChaveNome(c.nome.split(",")[0] ?? c.nome);
  const chaveId = normalizarChaveNome(c.id.replace(/-/g, " "));
  if (chaveFonte === nomePrincipal || chaveFonte === chaveId) return undefined;
  return fonte;
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

const ALINHAMENTO_LABEL: Record<string, string> = {
  C: "Caótico",
  N: "Neutro",
  O: "Ordeiro",
};

const ALINHAMENTO_ORDEM = ["O", "N", "C", "L"];

export function labelAlinhamento(al: string): string {
  const code = al.trim().toUpperCase();
  const nome = ALINHAMENTO_LABEL[code];
  return nome ? `${code} — ${nome}` : al;
}

export function getAlinhamentosParaFiltro(data: AmeacasData): string[] {
  const set = new Set<string>();
  for (const a of data.ameacas) {
    const code = a.al?.trim();
    if (code) set.add(code.toUpperCase());
  }
  return Array.from(set).sort((x, y) => {
    const ix = ALINHAMENTO_ORDEM.indexOf(x);
    const iy = ALINHAMENTO_ORDEM.indexOf(y);
    if (ix >= 0 && iy >= 0) return ix - iy;
    if (ix >= 0) return -1;
    if (iy >= 0) return 1;
    return x.localeCompare(y);
  });
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
    const al = filters.al.toUpperCase();
    list = list.filter((a) => a.al?.trim().toUpperCase() === al);
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
