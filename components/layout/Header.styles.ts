import styled from "styled-components";

const DESKTOP_BP = "1024px";

export const Header = styled.header<{ $fullHeight?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${({ theme, $fullHeight }) =>
    $fullHeight ? theme.headerHeight : "48px"};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 0 0 ${({ theme }) => theme.colors.borderHighlight};
  display: flex;
  flex-direction: column;
  z-index: 100;
`;

export const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};
`;

export const HeaderTitleWrap = styled.div`
  flex-shrink: 0;
`;

export const HeaderTitle = styled.h1<{ $specialFont?: boolean }>`
  margin: 0;
  font-size: ${({ theme, $specialFont }) =>
    $specialFont ? theme.typography.fontSize.xl : theme.typography.fontSize.lg};
  font-weight: ${({ $specialFont }) => ($specialFont ? "normal" : "500")};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: ${({ $specialFont }) => ($specialFont ? "0.05em" : "0.02em")};
  font-family: ${({ $specialFont }) =>
    $specialFont ? '"SigilosDeConhecimento", serif' : "inherit"};
  transition:
    font-family 0.5s ease,
    letter-spacing 0.5s ease;
`;

export const DesktopRollWrap = styled.div`
  display: none;
  flex: 1;
  min-width: 0;
  max-width: 360px;
  justify-content: flex-end;
  align-items: center;

  @media (min-width: ${DESKTOP_BP}) {
    display: flex;
  }
`;

export const MobileToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  @media (min-width: ${DESKTOP_BP}) {
    display: none;
  }
`;

export const HeaderRoll = styled.div<{ $visible?: boolean }>`
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  flex-direction: column;
  padding: 0 ${({ theme }) => theme.spacing.md}
    ${({ theme }) => theme.spacing.sm};
  gap: ${({ theme }) => theme.spacing.xs};

  @media (min-width: ${DESKTOP_BP}) {
    display: none;
  }
`;
