import React from "react";
import { ThemeProvider } from "styled-components";
import { render, type RenderOptions } from "@testing-library/react";
import { theme } from "@/lib/theme";
import { RollToastProvider } from "@/context/RollToastContext";

type Options = Omit<RenderOptions, "wrapper"> & {
  withToast?: boolean;
};

export function renderWithTheme(ui: React.ReactElement, options?: Options) {
  const { withToast, ...rest } = options ?? {};
  function Wrapper({ children }: { children: React.ReactNode }) {
    const inner = withToast ? (
      <RollToastProvider>{children}</RollToastProvider>
    ) : (
      children
    );
    return <ThemeProvider theme={theme}>{inner}</ThemeProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...rest });
}
