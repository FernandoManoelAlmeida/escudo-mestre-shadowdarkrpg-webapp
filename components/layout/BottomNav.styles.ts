import styled from "styled-components";
import { RasterIconSvg } from "@/components/ui/RasterIconSvg";

export const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  height: ${({ theme }) => theme.bottomNavHeight};
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 -1px 0 0 ${({ theme }) => theme.colors.borderHighlight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  overflow: visible;
  z-index: 100;
  padding: 0 max(${({ theme }) => theme.spacing.xs}, env(safe-area-inset-left, 0px))
    max(0px, env(safe-area-inset-bottom, 0px))
    max(${({ theme }) => theme.spacing.xs}, env(safe-area-inset-right, 0px));

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.lg};
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

export const NavItemWrap = styled.span`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const navSlot = `
  flex: 1 1 0;
  min-width: 0;
  max-width: 20%;
`;

export const NavLink = styled.a<{ $active?: boolean }>`
  ${navSlot}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 44px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  transition:
    background 0.15s,
    color 0.15s;
  -webkit-tap-highlight-color: transparent;
  ${({ theme, $active }) =>
    $active ? `text-shadow: 0 0 12px ${theme.colors.primaryGlow};` : ""}

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex: 0 0 auto;
    max-width: none;
    min-width: 64px;
  }
`;

export const NavIcon = styled(RasterIconSvg).withConfig({
  shouldForwardProp: (prop) => prop !== "$active",
})<{ $active?: boolean }>`
  width: 24px;
  height: 24px;
  display: block;
  flex-shrink: 0;
  opacity: ${({ $active }) => ($active ? 1 : 0.7)};
  transition: opacity 0.15s;
`;

/** Botão central (Início) em estilo FAB: círculo maior que sobressai da barra */
const FAB_SIZE = 56;
const FAB_RAISE = 18;

export const CentralButtonWrap = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -${FAB_RAISE}px;
  width: ${FAB_SIZE}px;
  height: ${FAB_SIZE}px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  box-shadow:
    0 0 0 3px ${({ theme }) => theme.colors.primaryGlow},
    0 4px 12px ${({ theme }) => theme.colors.primaryGlow};
  transition:
    background 0.2s,
    box-shadow 0.2s,
    transform 0.15s;
  z-index: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow:
      0 0 0 3px ${({ theme }) => theme.colors.primaryGlow},
      0 6px 16px ${({ theme }) => theme.colors.primaryGlow};
  }
`;

export const CentralButtonIcon = styled(RasterIconSvg)`
  width: 28px;
  height: 28px;
  display: block;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
`;

export const CentralLink = styled.a`
  flex: 0 0 auto;
  text-decoration: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
`;
