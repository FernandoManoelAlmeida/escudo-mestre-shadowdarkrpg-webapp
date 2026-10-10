export type ScrollToTabelaOptions = {
  behavior?: ScrollBehavior;
  /** Segundo scroll após animação do acordeão (ms). */
  followUpMs?: number;
  maxAttempts?: number;
  intervalMs?: number;
};

const DEFAULT_OPTS: ScrollToTabelaOptions = {
  behavior: "auto",
  followUpMs: 300,
  maxAttempts: 30,
  intervalMs: 50,
};

export function tabelaElementId(tableId: string): string {
  return `tabela-${tableId}`;
}

export function scrollToTabelaElement(
  tableId: string,
  options?: ScrollToTabelaOptions,
): () => void {
  const opts = { ...DEFAULT_OPTS, ...options };
  let cancelled = false;
  let attempt = 0;

  const cancel = () => {
    cancelled = true;
  };

  const tryScroll = () => {
    if (cancelled) return;
    const el = document.getElementById(tabelaElementId(tableId));
    if (el && el.offsetHeight > 0) {
      el.scrollIntoView({ block: "start", behavior: opts.behavior });
      if (opts.followUpMs && opts.followUpMs > 0) {
        window.setTimeout(() => {
          if (!cancelled) {
            el.scrollIntoView({ block: "start", behavior: "auto" });
          }
        }, opts.followUpMs);
      }
      return;
    }
    attempt += 1;
    if (attempt < (opts.maxAttempts ?? 30)) {
      window.setTimeout(tryScroll, opts.intervalMs ?? 50);
    }
  };

  if (typeof window !== "undefined") {
    requestAnimationFrame(() => tryScroll());
  }

  return cancel;
}
