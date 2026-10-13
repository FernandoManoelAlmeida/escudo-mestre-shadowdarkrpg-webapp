import { describe, it, expect, afterEach, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { isGitHubPagesBuildEnv } = require("../scripts/pages-build-env.js");

describe("pages-build-env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detecta GITHUB_ACTIONS + base path", () => {
    vi.stubEnv("GITHUB_PAGES", "");
    vi.stubEnv("GITHUB_ACTIONS", "true");
    expect(isGitHubPagesBuildEnv("/repo")).toBe(true);
  });
});
