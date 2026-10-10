"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { RollResult } from "@/lib/dice";

/** Máximo de rolagens mantidas no histórico do toaster */
export const ROLL_TOAST_MAX = 5;

export type RollEntry = {
  id: number;
  result: RollResult;
  suffix?: string;
  label?: string;
};

type RollToastContextValue = {
  rolls: RollEntry[];
  addRoll: (
    result: RollResult,
    opts?: { suffix?: string; label?: string },
  ) => void;
  removeRoll: (id: number) => void;
  clearRolls: () => void;
};

const RollToastContext = createContext<RollToastContextValue | null>(null);

let nextId = 1;

export function RollToastProvider({ children }: { children: React.ReactNode }) {
  const [rolls, setRolls] = useState<RollEntry[]>([]);

  const addRoll = useCallback(
    (result: RollResult, opts?: { suffix?: string; label?: string }) => {
      const entry: RollEntry = {
        id: nextId++,
        result,
        suffix: opts?.suffix,
        label: opts?.label,
      };
      setRolls((prev) => [entry, ...prev].slice(0, ROLL_TOAST_MAX));
    },
    [],
  );

  const removeRoll = useCallback((id: number) => {
    setRolls((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearRolls = useCallback(() => setRolls([]), []);

  const value = useMemo(
    () => ({ rolls, addRoll, removeRoll, clearRolls }),
    [rolls, addRoll, removeRoll, clearRolls],
  );

  return (
    <RollToastContext.Provider value={value}>
      {children}
    </RollToastContext.Provider>
  );
}

export function useRollToast(): RollToastContextValue {
  const ctx = useContext(RollToastContext);
  if (!ctx)
    throw new Error("useRollToast must be used within RollToastProvider");
  return ctx;
}
