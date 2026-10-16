import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "@/tests/utils/render-theme";
import {
  HistoryBackLink,
  shouldUseHistoryBack,
} from "./HistoryBackLink";

const back = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

function stubNav(opts: { referrer: string; historyLength: number }) {
  Object.defineProperty(document, "referrer", {
    configurable: true,
    get: () => opts.referrer,
  });
  Object.defineProperty(window, "history", {
    configurable: true,
    value: { length: opts.historyLength },
  });
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      origin: "http://localhost:3000",
      href: "http://localhost:3000/ameacas/goblin",
    },
  });
}

describe("shouldUseHistoryBack", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("true com referrer same-origin", () => {
    stubNav({
      referrer: "http://localhost:3000/ameacas?q=goblin",
      historyLength: 1,
    });
    expect(shouldUseHistoryBack()).toBe(true);
  });

  it("true com history.length > 1 sem referrer", () => {
    stubNav({ referrer: "", historyLength: 2 });
    expect(shouldUseHistoryBack()).toBe(true);
  });

  it("false sem referrer útil e history.length <= 1", () => {
    stubNav({ referrer: "", historyLength: 1 });
    expect(shouldUseHistoryBack()).toBe(false);
  });

  it("false com referrer de outra origem e history.length 1", () => {
    stubNav({ referrer: "https://evil.example/", historyLength: 1 });
    expect(shouldUseHistoryBack()).toBe(false);
  });
});

describe("HistoryBackLink", () => {
  beforeEach(() => {
    back.mockClear();
    push.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("chama router.back quando há histórico útil", () => {
    stubNav({
      referrer: "http://localhost:3000/ameacas?q=goblin",
      historyLength: 2,
    });
    renderWithTheme(
      <HistoryBackLink href="/ameacas">← Bestiário</HistoryBackLink>,
    );
    fireEvent.click(screen.getByRole("link", { name: /bestiário/i }));
    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it("usa push(href) sem histórico útil", () => {
    stubNav({ referrer: "", historyLength: 1 });
    renderWithTheme(
      <HistoryBackLink href="/ameacas">← Bestiário</HistoryBackLink>,
    );
    fireEvent.click(screen.getByRole("link", { name: /bestiário/i }));
    expect(push).toHaveBeenCalledWith("/ameacas");
    expect(back).not.toHaveBeenCalled();
  });
});
