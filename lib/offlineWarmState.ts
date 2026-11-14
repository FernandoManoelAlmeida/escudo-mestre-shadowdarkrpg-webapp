/** Estado local do pacote offline (revision por path). */

export const OFFLINE_WARM_REVISIONS_KEY = "offline-warm-revisions";

export type OfflineFileEntry = {
  path: string;
  revision: string;
};

export type OfflineManifest = {
  generatedAt?: string;
  files?: OfflineFileEntry[];
  /** @deprecated prefer files */
  paths?: string[];
};

export type OfflineWarmPlan = {
  /** Ficheiros a descarregar (faltam ou revision diferente). */
  toFetch: OfflineFileEntry[];
  /** Todos os ficheiros do manifesto actual. */
  all: OfflineFileEntry[];
  /** true se não há nada a descarregar. */
  upToDate: boolean;
};

export function normalizeManifestFiles(
  manifest: OfflineManifest,
): OfflineFileEntry[] {
  if (Array.isArray(manifest.files) && manifest.files.length > 0) {
    return manifest.files.filter(
      (f) => f && typeof f.path === "string" && typeof f.revision === "string",
    );
  }
  const paths = Array.isArray(manifest.paths) ? manifest.paths : [];
  return paths
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .map((p) => ({ path: p, revision: "" }));
}

export function readStoredRevisions(): Record<string, string> {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(OFFLINE_WARM_REVISIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function writeStoredRevisions(map: Record<string, string>): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(OFFLINE_WARM_REVISIONS_KEY, JSON.stringify(map));
}

export function clearStoredRevisions(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(OFFLINE_WARM_REVISIONS_KEY);
}

/**
 * Compara manifesto com revisions guardadas.
 * Sem revision no manifesto (legado): trata path ausente no storage como a descarregar.
 */
export function getOfflineWarmPlan(
  manifest: OfflineManifest,
  stored: Record<string, string> = readStoredRevisions(),
): OfflineWarmPlan {
  const all = normalizeManifestFiles(manifest);
  const toFetch = all.filter((f) => stored[f.path] !== f.revision);
  return {
    all,
    toFetch,
    upToDate: all.length > 0 && toFetch.length === 0,
  };
}

/** Após warm bem-sucedido dos `fetched`, funde revisions no storage. */
export function mergeStoredRevisions(fetched: OfflineFileEntry[]): void {
  const next = { ...readStoredRevisions() };
  for (const f of fetched) {
    next[f.path] = f.revision;
  }
  writeStoredRevisions(next);
}
