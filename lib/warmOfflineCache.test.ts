import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OFFLINE_WARM_REVISIONS_KEY } from "./offlineWarmState";
import { warmOfflineCache } from "./warmOfflineCache";

describe("warmOfflineCache", () => {
  const fetchMock = vi.fn();
  const postMessage = vi.fn();
  const cachePut = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    postMessage.mockReset();
    cachePut.mockReset();
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("caches", {
      open: vi.fn(async () => ({ put: cachePut })),
    });
    const sw = { postMessage };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        controller: sw,
        ready: Promise.resolve({ active: sw }),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("falha se o manifesto não existir", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });
    const result = await warmOfflineCache();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/indisponível/);
  });

  it("descarrega só paths com revision diferente e grava estado", async () => {
    localStorage.setItem(
      OFFLINE_WARM_REVISIONS_KEY,
      JSON.stringify({ "/data/a.json": "old" }),
    );
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          files: [
            { path: "/data/a.json", revision: "new" },
            { path: "/regras/", revision: "r1" },
          ],
        }),
      })
      .mockImplementation(async () => ({
        ok: true,
        clone: () => ({ ok: true }),
      }));

    const progress: { done: number; total: number }[] = [];
    const result = await warmOfflineCache({
      onProgress: (p) => progress.push({ ...p }),
    });

    expect(result.ok).toBe(true);
    expect(result.warmed).toBe(2);
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "CACHE_URLS" }),
    );
    expect(cachePut).toHaveBeenCalled();
    expect(progress.at(-1)).toEqual({ done: 2, total: 2 });
    const stored = JSON.parse(
      localStorage.getItem(OFFLINE_WARM_REVISIONS_KEY)!,
    ) as Record<string, string>;
    expect(stored["/data/a.json"]).toBe("new");
    expect(stored["/regras/"]).toBe("r1");
  });

  it("skipped quando já está actualizado", async () => {
    localStorage.setItem(
      OFFLINE_WARM_REVISIONS_KEY,
      JSON.stringify({ "/data/a.json": "r1" }),
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: [{ path: "/data/a.json", revision: "r1" }],
      }),
    });
    const result = await warmOfflineCache();
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
    expect(result.warmed).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
