import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockRegistration = { update: vi.fn(() => Promise.resolve()) };

Object.defineProperty(globalThis.navigator, "serviceWorker", {
  configurable: true,
  value: {
    register: vi.fn(() => Promise.resolve(mockRegistration)),
    getRegistration: vi.fn(() => Promise.resolve(undefined)),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

globalThis.fetch = vi.fn(
  async () =>
    ({
      ok: true,
      json: async () => ({ buildId: "vitest" }),
      text: async () => "",
    }) as Response,
) as typeof fetch;
