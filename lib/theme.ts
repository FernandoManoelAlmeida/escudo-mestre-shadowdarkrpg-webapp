/**
 * Escudo Shadowdark — base OSR em grafite neutro (fundo #2E3138, cartões
 * mais claros que o fundo); acentos funcionais (ação, origem, rolagem).
 */
export const theme = {
  colors: {
    background: "#2E3138",
    surface: "#3A3F47",
    surfaceHover: "#454B54",
    text: "#f0f0f0",
    textMuted: "#A8B2BC",
    primary: "#d54d4d",
    primaryHover: "#e86565",
    primaryGlow: "rgba(213, 77, 77, 0.25)",
    rollButton: "#8b2635",
    rollButtonHover: "#a32f41",
    border: "#565E68",
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
  contentMaxWidth: "720px",
  borderRadius: "4px",
} as const;

export type Theme = Omit<typeof theme, "colors"> & {
  colors: { [K in keyof typeof theme.colors]: string };
};
