import { assetUrl } from "@/lib/basePath";
import { PAGES_SHELL_CACHE } from "@/lib/pwaWorkboxPatterns";
import {
  getOfflineWarmPlan,
  mergeStoredRevisions,
  normalizeManifestFiles,
  type OfflineFileEntry,
  type OfflineManifest,
} from "@/lib/offlineWarmState";

export type WarmOfflineProgress = {
  done: number;
  total: number;
};

export type WarmOfflineResult = {
  ok: boolean;
  error?: string;
  warmed: number;
  total: number;
  /** true se já estava actualizado (nada a descarregar). */
  skipped?: boolean;
};

function toAbsoluteUrl(path: string): string {
  const rel = assetUrl(path.startsWith("/") ? path : `/${path}`);
  return new URL(rel, window.location.origin).href;
}

function isShellPath(path: string): boolean {
  return path === "/" || path.endsWith("/") || /\.html$/i.test(path);
}

async function ensureServiceWorker(): Promise<ServiceWorker | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) {
      return navigator.serviceWorker.controller;
    }
    return reg.active ?? null;
  } catch {
    return null;
  }
}

function requestServiceWorkerCache(
  controller: ServiceWorker | null,
  urls: string[],
): void {
  if (!controller || urls.length === 0) return;
  controller.postMessage({
    type: "CACHE_URLS",
    payload: { urlsToCache: urls },
  });
}

/** Grava HTML de rotas no cache runtime usado pelo CacheFirst de documentos. */
async function putShellInRuntimeCache(
  url: string,
  response: Response,
): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(PAGES_SHELL_CACHE);
    await cache.put(url, response.clone());
  } catch {
    /* ignore — CACHE_URLS / fetch ainda ajudam */
  }
}

export async function fetchOfflineManifest(
  signal?: AbortSignal,
): Promise<OfflineManifest | null> {
  try {
    const res = await fetch(assetUrl("/offline-manifest.json"), {
      credentials: "same-origin",
      cache: "no-store",
      signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as OfflineManifest;
  } catch {
    return null;
  }
}

/**
 * Descarrega só os ficheiros com revision diferente do storage
 * (Workbox runtime + CACHE_URLS). Não inclui version.json.
 */
export async function warmOfflineCache(opts?: {
  onProgress?: (p: WarmOfflineProgress) => void;
  signal?: AbortSignal;
}): Promise<WarmOfflineResult> {
  if (typeof window === "undefined") {
    return { ok: false, error: "Ambiente sem window.", warmed: 0, total: 0 };
  }

  const manifest = await fetchOfflineManifest(opts?.signal);
  if (!manifest) {
    return {
      ok: false,
      error: "Manifesto offline indisponível.",
      warmed: 0,
      total: 0,
    };
  }

  const all = normalizeManifestFiles(manifest);
  if (all.length === 0) {
    return {
      ok: false,
      error: "Manifesto offline vazio. Faça um build de produção.",
      warmed: 0,
      total: 0,
    };
  }

  const plan = getOfflineWarmPlan(manifest);
  if (plan.upToDate) {
    return { ok: true, warmed: 0, total: 0, skipped: true };
  }

  const controller = await ensureServiceWorker();
  if (
    process.env.NODE_ENV === "production" &&
    !controller &&
    !navigator.serviceWorker?.controller
  ) {
    return {
      ok: false,
      error:
        "Service worker indisponível. Abra a app em produção com rede e tente de novo.",
      warmed: 0,
      total: plan.toFetch.length,
    };
  }

  const toFetch = plan.toFetch;
  const urls = toFetch.map((f) => toAbsoluteUrl(f.path));
  requestServiceWorkerCache(controller, urls);

  let warmed = 0;
  const total = urls.length;
  const succeeded: OfflineFileEntry[] = [];
  opts?.onProgress?.({ done: 0, total });

  for (let i = 0; i < toFetch.length; i++) {
    if (opts?.signal?.aborted) {
      if (succeeded.length > 0) mergeStoredRevisions(succeeded);
      return {
        ok: false,
        error: "Preparação offline cancelada.",
        warmed,
        total,
      };
    }
    const entry = toFetch[i]!;
    const url = urls[i]!;
    try {
      const res = await fetch(url, {
        credentials: "same-origin",
        signal: opts?.signal,
      });
      if (res.ok) {
        if (isShellPath(entry.path)) {
          await putShellInRuntimeCache(url, res);
        }
        warmed += 1;
        succeeded.push(entry);
      }
    } catch {
      /* continua — partial warm ainda ajuda */
    }
    opts?.onProgress?.({ done: warmed, total });
  }

  if (succeeded.length > 0) {
    mergeStoredRevisions(succeeded);
  }

  if (warmed === 0) {
    return {
      ok: false,
      error: "Não foi possível descarregar os ficheiros. Verifique a rede.",
      warmed,
      total,
    };
  }

  return { ok: true, warmed, total };
}
