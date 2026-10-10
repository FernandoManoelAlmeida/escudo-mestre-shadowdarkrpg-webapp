"use client";

import { ThemeProvider } from "styled-components";
import { theme } from "@/lib/theme";
import { GlobalStyles } from "@/components/layout/GlobalStyles";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import UpdateBanner from "@/components/layout/UpdateBanner";
import { RollToastProvider } from "@/context/RollToastContext";
import RollToaster from "@/components/ui/RollToaster";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <RollToastProvider>
        <GlobalStyles />
        <a
          href="#main-content"
          style={{
            position: "absolute",
            left: "-9999px",
            zIndex: 9999,
            padding: "0.5rem",
            background: "#141414",
            color: theme.colors.primary,
          }}
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="main-content" role="main">
          {children}
        </main>
        <BottomNav />
        <RollToaster />
        <UpdateBanner />
      </RollToastProvider>
    </ThemeProvider>
  );
}
