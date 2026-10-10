import { theme } from "@/lib/theme";

/**
 * Cores para instalação PWA / splash / barra do sistema.
 * Mantém fundo escuro (identidade do app); varia levemente com prefers-color-scheme.
 */
export const pwaChromeColors = {
  /** Sistema em modo escuro: paleta do tema do app */
  dark: {
    themeColor: theme.colors.surface,
    backgroundColor: theme.colors.background,
  },
  /** Sistema em modo claro: ainda escuro, tom ligeiramente mais claro para contraste com UI do SO */
  light: {
    themeColor: "#121920",
    backgroundColor: "#1c2430",
  },
} as const;

/**
 * Um único par de cores para manifest e meta legados (Android WebView antigo, Edge/Windows,
 * parsers que não aceitam theme_color em lista). Sempre a identidade escura do app.
 */
export const pwaInstallSolidColors = {
  themeColor: pwaChromeColors.dark.themeColor,
  backgroundColor: pwaChromeColors.dark.backgroundColor,
} as const;
