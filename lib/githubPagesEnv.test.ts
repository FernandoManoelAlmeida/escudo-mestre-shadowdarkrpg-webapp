import { describe, it, expect, afterEach, vi } from "vitest";
import { isGitHubPagesBuild } from "./githubPagesEnv";

describe("isGitHubPagesBuild", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("aceita GITHUB_PAGES=1 e true", () => {
    vi.stubEnv("GITHUB_PAGES", "1");
    expect(isGitHubPagesBuild()).toBe(true);
    vi.stubEnv("GITHUB_PAGES", "true");
    expect(isGitHubPagesBuild()).toBe(true);
  });

  it("rejeita ausente ou false", () => {
    vi.stubEnv("GITHUB_PAGES", "");
    expect(isGitHubPagesBuild()).toBe(false);
    vi.stubEnv("GITHUB_PAGES", "false");
    expect(isGitHubPagesBuild()).toBe(false);
  });

  it("aceita GITHUB_ACTIONS com NEXT_PUBLIC_BASE_PATH", () => {
    vi.stubEnv("GITHUB_PAGES", "");
    vi.stubEnv("GITHUB_ACTIONS", "true");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/escudo-mestre-shadowdarkrpg-webapp");
    expect(isGitHubPagesBuild()).toBe(true);
  });
});
