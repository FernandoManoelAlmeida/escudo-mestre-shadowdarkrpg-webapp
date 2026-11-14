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
/** Máximo de avisos de texto (ex.: offline) no toaster */
export const INFO_TOAST_MAX = 3;

export type RollEntry = {
  id: number;
  result: RollResult;
  suffix?: string;
  label?: string;
};

export type InfoEntry = {
  id: number;
  message: string;
};

type RollToastContextValue = {
  rolls: RollEntry[];
  infos: InfoEntry[];
  addRoll: (
    result: RollResult,
    opts?: { suffix?: string; label?: string },
  ) => void;
  notify: (message: string) => void;
  removeRoll: (id: number) => void;
  removeInfo: (id: number) => void;
  clearRolls: () => void;
};

const RollToastContext = createContext<RollToastContextValue | null>(null);

let nextId = 1;

export function RollToastProvider({ children }: { children: React.ReactNode }) {
  const [rolls, setRolls] = useState<RollEntry[]>([]);
  const [infos, setInfos] = useState<InfoEntry[]>([]);

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

  const notify = useCallback((message: string) => {
    const text = message.trim();
    if (!text) return;
    const entry: InfoEntry = { id: nextId++, message: text };
    setInfos((prev) => [entry, ...prev].slice(0, INFO_TOAST_MAX));
  }, []);

  const removeRoll = useCallback((id: number) => {
    setRolls((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const removeInfo = useCallback((id: number) => {
    setInfos((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearRolls = useCallback(() => {
    setRolls([]);
    setInfos([]);
  }, []);

  const value = useMemo(
    () => ({
      rolls,
      infos,
      addRoll,
      notify,
      removeRoll,
      removeInfo,
      clearRolls,
    }),
    [rolls, infos, addRoll, notify, removeRoll, removeInfo, clearRolls],
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
