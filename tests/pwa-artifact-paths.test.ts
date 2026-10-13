import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  findExistingSwPath,
  listSwCandidates,
} = require("../scripts/pwa-artifact-paths.js");

describe("pwa-artifact-paths", () => {
  it("encontra sw em public/<basePath>/sw.js", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "em-pwa-path-"));
    const bp = "/repo";
    fs.mkdirSync(path.join(dir, "public", "repo"), { recursive: true });
    const nested = path.join(dir, "public", "repo", "sw.js");
    fs.writeFileSync(nested, "sw", "utf8");
    expect(findExistingSwPath(dir, bp)).toBe(nested);
    expect(listSwCandidates(dir, bp)[0]).toBe(nested);
  });
});
