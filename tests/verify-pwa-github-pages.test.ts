import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { readSwUrls } = require("../scripts/verify-pwa-github-pages.js");

describe("verify-pwa-github-pages", () => {
  it("readSwUrls extrai URLs do precache", () => {
    const sw = 'precacheAndRoute([{url:"/repo/data/x.json",revision:"1"}])';
    expect(readSwUrls(sw)).toEqual(["/repo/data/x.json"]);
  });
});
