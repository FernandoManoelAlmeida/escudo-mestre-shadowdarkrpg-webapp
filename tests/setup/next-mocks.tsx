import { vi } from "vitest";
import React from "react";

export const mockUsePathname = vi.fn(() => "/");

vi.mock("next/link", () => ({
  default({
    children,
    href,
    ...rest
  }: {
    children?: React.ReactNode;
    href: string | Record<string, unknown>;
  } & React.ComponentProps<"a">) {
    const to = typeof href === "string" ? href : "#";
    return (
      <a href={to} {...rest}>
        {children}
      </a>
    );
  },
}));

/** Callbacks registados por `useServerInsertedHTML` (ex.: testes do Registry). */
export const serverInsertedHtmlCallbacks: Array<() => unknown> = [];

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useServerInsertedHTML: (fn: () => unknown) => {
    serverInsertedHtmlCallbacks.push(fn);
  },
}));
