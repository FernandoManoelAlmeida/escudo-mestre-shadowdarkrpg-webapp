import { describe, it, expect } from "vitest";
import {
  HOME_OFFLINE_NOTIFY_FROM,
  HOME_OFFLINE_TAPS_REQUIRED,
  isHomePath,
  offlineTapCountdownMessage,
  remainingOfflineTaps,
} from "./homeOfflineGesture";

describe("homeOfflineGesture", () => {
  it("reconhece a Home com ou sem barra final", () => {
    expect(isHomePath("/")).toBe(true);
    expect(isHomePath("")).toBe(true);
    expect(isHomePath("//")).toBe(true);
    expect(isHomePath("/regras")).toBe(false);
  });

  it("conta restantes até 7", () => {
    expect(remainingOfflineTaps(0)).toBe(HOME_OFFLINE_TAPS_REQUIRED);
    expect(remainingOfflineTaps(3)).toBe(4);
    expect(remainingOfflineTaps(7)).toBe(0);
  });

  it("só gera mensagem a partir do 3.º toque", () => {
    expect(offlineTapCountdownMessage(1)).toBeNull();
    expect(offlineTapCountdownMessage(2)).toBeNull();
    expect(offlineTapCountdownMessage(HOME_OFFLINE_NOTIFY_FROM)).toMatch(
      /Faltam 4 toques/,
    );
    expect(offlineTapCountdownMessage(6)).toMatch(/Falta 1 toque/);
    expect(offlineTapCountdownMessage(HOME_OFFLINE_TAPS_REQUIRED)).toBeNull();
  });
});
