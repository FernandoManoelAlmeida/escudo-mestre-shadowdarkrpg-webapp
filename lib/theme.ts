/**
 * Escudo Shadowdark — base OSR P&B; acentos funcionais (ação, origem, rolagem).
 */
export const theme = {
  colors: {
    background: "#0a0a0a",
    surface: "#141414",
    surfaceHover: "#1c1c1c",
    text: "#f0f0f0",
    textMuted: "#9a9a9a",
    primary: "#d54d4d",
    primaryHover: "#e86565",
    primaryGlow: "rgba(213, 77, 77, 0.25)",
    rollButton: "#8b2635",
    rollButtonHover: "#a32f41",
    border: "#2a2a2a",
    borderHighlight: "rgba(213, 77, 77, 0.45)",
    success: "#22c55e",
    danger: "#ef4444",
    badgeOficial: "#d54d4d",
    badgeHomebrew: "#9b6b8e",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  breakpoints: {
    mobile: "320px",
    tablet: "768px",
    desktop: "1024px",
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
    },
  },
  bottomNavHeight: "56px",
  headerHeight: "124px",
  borderRadius: "4px",
} as const;

export type Theme = Omit<typeof theme, "colors"> & {
  colors: { [K in keyof typeof theme.colors]: string };
};
