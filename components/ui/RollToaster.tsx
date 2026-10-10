"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import styled, { css, keyframes } from "styled-components";
import { useRollToast } from "@/context/RollToastContext";
import type { RollResult } from "@/lib/dice";
import { theme as appTheme } from "@/lib/theme";

const SWIPE_THRESHOLD_PX = 56;

const toastEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const totalPulse = keyframes`
  0%,
  100% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.08);
  }
  70% {
    transform: scale(1.02);
  }
`;

const Container = styled.div`
  position: fixed;
  bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.md}
  );
  right: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  max-width: min(360px, 100%);
  margin-left: auto;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  pointer-events: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    left: auto;
    max-width: min(640px, calc(100vw - ${({ theme }) => theme.spacing.md} * 2));
  }
`;

const Toolbar = styled.div`
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end !important;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 0 2px;
`;

const ClearAllBtn = styled.button`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  transition:
    color 0.15s,
    border-color 0.15s,
    background 0.15s,
    box-shadow 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primaryHover};
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.4),
      0 0 0 1px ${({ theme }) => theme.colors.primaryGlow};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const List = styled.div`
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: min(340px, 58vh);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  padding: 2px;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: visible;
    max-height: none;
    padding-bottom: ${({ theme }) => theme.spacing.sm};
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ToastCard = styled.article<{ $isNewest: boolean }>`
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px dashed ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.45),
    0 0 0 1px ${({ theme }) => theme.colors.primaryGlow};
  animation: ${toastEnter} 0.38s ease forwards;
  touch-action: pan-y;
  cursor: pointer;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: auto;
    min-width: 232px;
    max-width: 280px;
  }

  ${({ $isNewest, theme }) =>
    $isNewest
      ? `
    border-style: solid;
    border-width: 1px;
    box-shadow:
      0 10px 32px rgba(0, 0, 0, 0.5),
      0 0 0 1px ${theme.colors.primaryGlow},
      0 0 20px ${theme.colors.primaryGlow};
  `
      : ""}
`;

const ToastBody = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
`;

const ToastLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 4px;
  font-weight: 500;
`;

const TotalRow = styled.div<{ $pulse?: boolean }>`
  font-size: ${({ theme, $pulse }) =>
    $pulse ? theme.typography.fontSize["2xl"] : theme.typography.fontSize.lg};
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.15;
  letter-spacing: -0.02em;

  ${({ $pulse }) =>
    $pulse &&
    css`
      animation: ${totalPulse} 0.65s ease 1;
    `}
`;

const DetailLine = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 6px;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
  word-break: break-word;
`;

const Highlight = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

function RollDetailText({
  result,
  suffix,
}: {
  result: RollResult;
  suffix?: string;
}) {
  const { rolls, modifier, total, chosenD20 } = result;
  const modToShow =
    chosenD20 != null && total !== chosenD20 ? total - chosenD20 : modifier;
  const modStr =
    modToShow !== 0
      ? modToShow >= 0
        ? `+${modToShow}`
        : String(modToShow)
      : "";
  const rollsPart = rolls.map((r, i) =>
    r === chosenD20 ? <Highlight key={i}>{r}</Highlight> : r,
  );
  const suffixPart = suffix ? ` ${suffix}` : "";
  return (
    <>
      [
      {rollsPart.reduce<ReactNode[]>((acc, node, i) => {
        if (i > 0) acc.push(", ");
        acc.push(node);
        return acc;
      }, [])}
      ]{modStr && <>{modStr}</>} = {total}
      {suffixPart}
    </>
  );
}

type ToastItemProps = {
  entryId: number;
  label?: string;
  result: RollResult;
  suffix?: string;
  isNewest: boolean;
  onRemove: (id: number) => void;
};

function ToastItem({
  entryId,
  label,
  result,
  suffix,
  isNewest,
  onRemove,
}: ToastItemProps) {
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current == null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
        onRemove(entryId);
      }
    },
    [entryId, onRemove],
  );

  const { total } = result;

  const dismiss = useCallback(() => onRemove(entryId), [entryId, onRemove]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    },
    [dismiss],
  );

  return (
    <ToastCard
      $isNewest={isNewest}
      role="button"
      tabIndex={0}
      aria-label={
        label
          ? `${label}: total ${total}. Clique para fechar.`
          : `Rolagem, total ${total}. Clique para fechar.`
      }
      onClick={dismiss}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ToastBody>
        {label && <ToastLabel>{label}</ToastLabel>}
        <TotalRow $pulse={isNewest}>{total}</TotalRow>
        <DetailLine>
          <RollDetailText result={result} suffix={suffix} />
        </DetailLine>
      </ToastBody>
    </ToastCard>
  );
}

export default function RollToaster() {
  const { rolls, removeRoll, clearRolls } = useRollToast();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (rolls.length === 0) return;
      removeRoll(rolls[0]!.id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rolls, removeRoll]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const mq = window.matchMedia(`(min-width: ${appTheme.breakpoints.tablet})`);
    if (mq.matches) {
      el.scrollLeft = 0;
    } else {
      el.scrollTop = 0;
    }
  }, [rolls.length]);

  if (rolls.length === 0) return null;

  return (
    <Container role="region" aria-label="Rolagens recentes">
      {rolls.length > 1 && (
        <Toolbar>
          <ClearAllBtn type="button" onClick={clearRolls}>
            Limpar tudo
          </ClearAllBtn>
        </Toolbar>
      )}
      <List ref={listRef} aria-live="polite" aria-relevant="additions removals">
        {rolls.map((entry, index) => (
          <ToastItem
            key={entry.id}
            entryId={entry.id}
            label={entry.label}
            result={entry.result}
            suffix={entry.suffix}
            isNewest={index === 0}
            onRemove={removeRoll}
          />
        ))}
      </List>
    </Container>
  );
}
