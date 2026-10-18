import { mapTokenNomenclature } from "@/lib/githNomenclature";

export type AmeacaToken = {
  url: string;
  credito?: string;
  /** Link do crédito na figcaption (Community Tokens, You See This, …). */
  creditoUrl?: string;
  rotulo?: string;
  /** Origem da arte no sidecar (`community-tokens` | `yst`). */
  fonte?: string;
};

export type AmeacasTokensData = {
  tokens: Record<string, AmeacaToken>;
};

const TOKENS_URL =
  (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/data/ameacas-tokens.json";

let cached: AmeacasTokensData | null = null;

export async function getAmeacasTokens(): Promise<AmeacasTokensData> {
  if (cached) return cached;
  const res = await fetch(TOKENS_URL);
  if (!res.ok) {
    cached = { tokens: {} };
    return cached;
  }
  const raw = (await res.json()) as Partial<AmeacasTokensData>;
  const tokens: Record<string, AmeacaToken> = {};
  for (const [id, tok] of Object.entries(raw.tokens ?? {})) {
    tokens[id] = mapTokenNomenclature(tok);
  }
  cached = { tokens };
  return cached;
}

export function getTokenByAmeacaId(
  data: AmeacasTokensData,
  id: string,
): AmeacaToken | undefined {
  return data.tokens?.[id];
}

/** Limpa cache (testes). */
export function clearAmeacasTokensCache(): void {
  cached = null;
}
