import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  OFFLINE_WARM_REVISIONS_KEY,
  clearStoredRevisions,
  getOfflineWarmPlan,
  mergeStoredRevisions,
  normalizeManifestFiles,
  readStoredRevisions,
  writeStoredRevisions,
} from "./offlineWarmState";

describe("offlineWarmState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("normalizeManifestFiles prefer files a paths", () => {
    const files = normalizeManifestFiles({
      files: [{ path: "/a", revision: "1" }],
      paths: ["/b"],
    });
    expect(files).toEqual([{ path: "/a", revision: "1" }]);
  });

  it("getOfflineWarmPlan sem estado → todos; igual → vazio; um diferente → só esse", () => {
    const manifest = {
      files: [
        { path: "/a", revision: "r1" },
        { path: "/b", revision: "r2" },
      ],
    };
    expect(getOfflineWarmPlan(manifest, {}).toFetch).toHaveLength(2);

    const stored = { "/a": "r1", "/b": "r2" };
    expect(getOfflineWarmPlan(manifest, stored).upToDate).toBe(true);
    expect(getOfflineWarmPlan(manifest, stored).toFetch).toHaveLength(0);

    const partial = getOfflineWarmPlan(manifest, { "/a": "r1", "/b": "old" });
    expect(partial.toFetch).toEqual([{ path: "/b", revision: "r2" }]);
  });

  it("mergeStoredRevisions grava e clearStoredRevisions limpa", () => {
    writeStoredRevisions({ "/a": "1" });
    mergeStoredRevisions([{ path: "/b", revision: "2" }]);
    expect(readStoredRevisions()).toEqual({ "/a": "1", "/b": "2" });
    clearStoredRevisions();
    expect(localStorage.getItem(OFFLINE_WARM_REVISIONS_KEY)).toBeNull();
  });
});
