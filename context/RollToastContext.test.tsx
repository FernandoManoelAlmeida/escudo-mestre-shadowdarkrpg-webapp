import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";

describe("RollToastContext", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("useRollToast lança fora do provider", async () => {
    const { useRollToast } = await import("./RollToastContext");
    expect(() => {
      renderHook(() => useRollToast());
    }).toThrow("useRollToast must be used within RollToastProvider");
  });

  it("addRoll, removeRoll e clearRolls; limita histórico a ROLL_TOAST_MAX", async () => {
    const { RollToastProvider, useRollToast, ROLL_TOAST_MAX } =
      await import("./RollToastContext");
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RollToastProvider>{children}</RollToastProvider>
    );
    const roll = {
      formula: "1d20",
      rolls: [12],
      modifier: 0,
      total: 12,
      display: "[12] = 12",
    };
    const { result } = renderHook(() => useRollToast(), { wrapper });

    act(() => {
      result.current.addRoll(roll, { label: "Teste" });
    });
    expect(result.current.rolls).toHaveLength(1);
    expect(result.current.rolls[0]!.label).toBe("Teste");

    const firstId = result.current.rolls[0]!.id;
    act(() => {
      result.current.removeRoll(firstId);
    });
    expect(result.current.rolls).toHaveLength(0);

    act(() => {
      for (let i = 0; i < ROLL_TOAST_MAX + 3; i++) {
        result.current.addRoll({ ...roll, total: i });
      }
    });
    expect(result.current.rolls).toHaveLength(ROLL_TOAST_MAX);

    act(() => {
      result.current.clearRolls();
    });
    expect(result.current.rolls).toHaveLength(0);
  });

  it("notify adiciona aviso de texto e clearRolls limpa infos", async () => {
    const { RollToastProvider, useRollToast } = await import("./RollToastContext");
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RollToastProvider>{children}</RollToastProvider>
    );
    const { result } = renderHook(() => useRollToast(), { wrapper });

    act(() => {
      result.current.notify("Faltam 4 toques no Início para preparar o modo offline.");
    });
    expect(result.current.infos).toHaveLength(1);
    expect(result.current.infos[0]!.message).toMatch(/Faltam 4/);

    act(() => {
      result.current.clearRolls();
    });
    expect(result.current.infos).toHaveLength(0);
  });

  it("notify com replace mantém só um toast de info e o mesmo id", async () => {
    const { RollToastProvider, useRollToast } = await import("./RollToastContext");
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RollToastProvider>{children}</RollToastProvider>
    );
    const { result } = renderHook(() => useRollToast(), { wrapper });

    act(() => {
      result.current.notify("a");
    });
    const id = result.current.infos[0]!.id;
    act(() => {
      result.current.notify("b", { replace: true });
    });
    expect(result.current.infos).toHaveLength(1);
    expect(result.current.infos[0]!.message).toBe("b");
    expect(result.current.infos[0]!.id).toBe(id);
  });

  it("notify com sticky marca o info como sticky", async () => {
    const { RollToastProvider, useRollToast } = await import("./RollToastContext");
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RollToastProvider>{children}</RollToastProvider>
    );
    const { result } = renderHook(() => useRollToast(), { wrapper });

    act(() => {
      result.current.notify("Preparando modo offline…", {
        replace: true,
        sticky: true,
        skipEnter: true,
      });
    });
    expect(result.current.infos).toHaveLength(1);
    expect(result.current.infos[0]!.sticky).toBe(true);
    expect(result.current.infos[0]!.skipEnter).toBe(true);

    act(() => {
      result.current.notify("Pronto para uso offline.", {
        replace: true,
        sticky: false,
        skipEnter: true,
      });
    });
    expect(result.current.infos[0]!.sticky).toBe(false);
    expect(result.current.infos[0]!.skipEnter).toBe(true);
    expect(result.current.infos[0]!.message).toMatch(/Pronto/);
  });
});
