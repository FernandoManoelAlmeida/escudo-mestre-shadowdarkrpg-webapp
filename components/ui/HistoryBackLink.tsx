"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  /** Destino se não houver histórico útil (tab directa). */
  href: string;
};

/** True when the previous history entry is likely same-origin (preserves list filters). */
export function shouldUseHistoryBack(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.origin === window.location.origin) return true;
    }
  } catch {
    /* ignore invalid referrer */
  }
  return window.history.length > 1;
}

/**
 * «Voltar» que prefere o histórico do browser (query/filtros da listagem)
 * e cai no `href` se não houver histórico útil (ex. tab directa).
 */
export function HistoryBackLink({ href, onClick, children, ...rest }: Props) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    if (shouldUseHistoryBack()) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
