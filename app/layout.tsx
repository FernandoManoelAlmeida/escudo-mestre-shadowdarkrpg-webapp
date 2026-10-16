import type { Metadata, Viewport } from "next";
import StyledComponentsRegistry from "@/components/layout/Registry";
import ClientLayout from "@/components/layout/ClientLayout";
import { pwaIconPath } from "@/lib/rasterIcons";
import { pwaChromeColors } from "@/lib/pwaColors";

export const metadata: Metadata = {
  title: "Escudo do Mestre — Shadowdark",
  description:
    "Consulta de regras, tabelas, geradores e bestiário Shadowdark.",
  appleWebApp: {
    capable: true,
    title: "Escudo Shadowdark",
    /** Barra de status escura; conteúdo pode estender por baixo (alinhado ao tema escuro). */
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: pwaIconPath("header-icon.webp"),
    apple: pwaIconPath("icon-192.webp"),
  },
  /** Windows / Edge legado: Live Tile e cor da barra de navegação ao fixar o site. */
  other: {
    "msapplication-TileColor": pwaChromeColors.dark.backgroundColor,
    "msapplication-navbutton-color": pwaChromeColors.dark.themeColor,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  /** App é escuro; meta theme-color segue o modo do SO com tons escuros da identidade */
  colorScheme: "dark",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: pwaChromeColors.light.themeColor,
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: pwaChromeColors.dark.themeColor,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.style.setProperty('--header-height','48px');`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <StyledComponentsRegistry>
          <ClientLayout>{children}</ClientLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
