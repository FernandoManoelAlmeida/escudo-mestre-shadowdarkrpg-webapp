import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const runPagesCi = process.env.RUN_PAGES_CI === "1";

describe.skipIf(!runPagesCi)("ci-github-pages-simulate", () => {
  it(
    "build:pages:ci-simulate completa com verify PWA",
    () => {
      const script = path.join(repoRoot, "scripts", "simulate-github-pages-ci.sh");
      const result = spawnSync("bash", [script], {
        cwd: repoRoot,
        env: { ...process.env, PATH: process.env.PATH },
        encoding: "utf8",
        timeout: 15 * 60 * 1000,
      });
      if (result.status !== 0) {
        console.error(result.stdout);
        console.error(result.stderr);
      }
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("simulate-github-pages-ci: OK");
    },
    15 * 60 * 1000,
  );
});
