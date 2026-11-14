import { assetUrl } from "@/lib/basePath";

export type WarmOfflineProgress = {
  done: number;
  total: number;
};

export type WarmOfflineResult = {
  ok: boolean;
  error?: string;
  warmed: number;
  total: number;
};

type OfflineManifest = {
  generatedAt?: string;
  paths: string[];
};

function toAbsoluteUrl(path: string): string {
  const rel = assetUrl(path.startsWith("/") ? path : `/${path}`);
  return new URL(rel, window.location.origin).href;
}

function requestServiceWorkerCache(urls: string[]): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  const controller = navigator.serviceWorker.controller;
  if (!controller) return;
  controller.postMessage({
    type: "CACHE_URLS",
    payload: { urlsToCache: urls },
  });
}

/**
 * Descarrega o pacote listado em `/offline-manifest.json` para o cache
 * (Workbox runtime + mensagem CACHE_URLS). Não inclui version.json.
 */
export async function warmOfflineCache(opts?: {
  onProgress?: (p: WarmOfflineProgress) => void;
  signal?: AbortSignal;
}): Promise<WarmOfflineResult> {
  if (typeof window === "undefined") {
    return { ok: false, error: "Ambiente sem window.", warmed: 0, total: 0 };
  }

  let manifest: OfflineManifest;
  try {
    const res = await fetch(assetUrl("/offline-manifest.json"), {
      credentials: "same-origin",
      cache: "no-store",
      signal: opts?.signal,
    });
    if (!res.ok) {
      return {
        ok: false,
        error: `Manifesto offline indisponível (${res.status}).`,
        warmed: 0,
        total: 0,
      };
    }
    manifest = (await res.json()) as OfflineManifest;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao ler o manifesto.";
    return { ok: false, error: msg, warmed: 0, total: 0 };
  }

  const paths = Array.isArray(manifest.paths) ? manifest.paths : [];
  if (paths.length === 0) {
    return {
      ok: false,
      error: "Manifesto offline vazio. Faça um build de produção.",
      warmed: 0,
      total: 0,
    };
  }

  const urls = paths.map(toAbsoluteUrl);
  requestServiceWorkerCache(urls);

  let warmed = 0;
  const total = urls.length;
  opts?.onProgress?.({ done: 0, total });

  for (const url of urls) {
    if (opts?.signal?.aborted) {
      return {
        ok: false,
        error: "Preparação offline cancelada.",
        warmed,
        total,
      };
    }
    try {
      await fetch(url, { credentials: "same-origin", signal: opts?.signal });
      warmed += 1;
    } catch {
      /* continua — partial warm ainda ajuda */
    }
    opts?.onProgress?.({ done: warmed, total });
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
