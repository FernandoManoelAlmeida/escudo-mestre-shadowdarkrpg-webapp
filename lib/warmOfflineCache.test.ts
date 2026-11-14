import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { warmOfflineCache } from "./warmOfflineCache";

describe("warmOfflineCache", () => {
  const fetchMock = vi.fn();
  const postMessage = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    postMessage.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { controller: { postMessage } },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falha se o manifesto não existir", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });
    const result = await warmOfflineCache();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/indisponível/);
  });

  it("descarrega paths e notifica o service worker", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ paths: ["/data/a.json", "/regras/"] }),
      })
      .mockResolvedValue({ ok: true });

    const progress: { done: number; total: number }[] = [];
    const result = await warmOfflineCache({
      onProgress: (p) => progress.push({ ...p }),
    });

    expect(result.ok).toBe(true);
    expect(result.warmed).toBe(2);
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "CACHE_URLS" }),
    );
    expect(progress.at(-1)).toEqual({ done: 2, total: 2 });
  });
});
