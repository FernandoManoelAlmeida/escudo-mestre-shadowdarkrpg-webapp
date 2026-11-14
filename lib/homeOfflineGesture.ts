/** Toques no Início (já na Home) para aquecer o cache offline. */
export const HOME_OFFLINE_TAPS_REQUIRED = 7;
/** A partir deste toque, o toaster avisa quantos faltam. */
export const HOME_OFFLINE_NOTIFY_FROM = 3;
/** Sem toque válido neste intervalo, o contador reinicia. */
export const HOME_OFFLINE_TAP_WINDOW_MS = 2000;

export function isHomePath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  return p === "/";
}

export function remainingOfflineTaps(count: number): number {
  return Math.max(0, HOME_OFFLINE_TAPS_REQUIRED - count);
}

/** Mensagem do toaster para toques 3–6; null nos silenciosos ou no 7.º. */
export function offlineTapCountdownMessage(count: number): string | null {
  if (count < HOME_OFFLINE_NOTIFY_FROM) return null;
  if (count >= HOME_OFFLINE_TAPS_REQUIRED) return null;
  const left = remainingOfflineTaps(count);
  if (left === 1) {
    return "Falta 1 toque no Início para preparar o modo offline.";
  }
  return `Faltam ${left} toques no Início para preparar o modo offline.`;
}
