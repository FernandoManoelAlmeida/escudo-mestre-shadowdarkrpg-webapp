"use client";

import { useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { RasterIconName } from "@/lib/rasterIcons";
import { isCopyrightFreeRouteEnabled } from "@/lib/copyrightFreeRoutes";
import { useRollToast } from "@/context/RollToastContext";
import {
  HOME_OFFLINE_TAP_WINDOW_MS,
  HOME_OFFLINE_TAPS_REQUIRED,
  isHomePath,
  offlineTapCountdownMessage,
} from "@/lib/homeOfflineGesture";
import { warmOfflineCache } from "@/lib/warmOfflineCache";
import {
  Nav,
  NavLink,
  NavIcon,
  NavItemWrap,
  CentralButtonWrap,
  CentralButtonIcon,
  CentralLink,
} from "./BottomNav.styles";

const ALL_ITEMS: { href: string; label: string; iconName: RasterIconName }[] = [
  { href: "/regras", label: "Regras", iconName: "regras-icon" },
  { href: "/geradores", label: "Geradores", iconName: "geradores-icon" },
  { href: "/", label: "Início", iconName: "home-icon" },
  { href: "/ameacas", label: "Ameaças", iconName: "ameacas-icon" },
  { href: "/arcanos", label: "Arcanos", iconName: "itens-magicos-icon" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { notify } = useRollToast();
  const items = ALL_ITEMS.filter((item) =>
    isCopyrightFreeRouteEnabled(item.href),
  );
  const homeTapCount = useRef(0);
  const homeTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warming = useRef(false);

  const resetHomeTaps = useCallback(() => {
    homeTapCount.current = 0;
    if (homeTapTimer.current) {
      clearTimeout(homeTapTimer.current);
      homeTapTimer.current = null;
    }
  }, []);

  const scheduleHomeTapReset = useCallback(() => {
    if (homeTapTimer.current) clearTimeout(homeTapTimer.current);
    homeTapTimer.current = setTimeout(() => {
      homeTapCount.current = 0;
      homeTapTimer.current = null;
    }, HOME_OFFLINE_TAP_WINDOW_MS);
  }, []);

  const handleHomeOfflineGesture = useCallback(() => {
    if (!isHomePath(pathname)) {
      resetHomeTaps();
      return;
    }
    if (warming.current) return;

    homeTapCount.current += 1;
    const count = homeTapCount.current;
    scheduleHomeTapReset();

    const countdown = offlineTapCountdownMessage(count);
    if (countdown) {
      notify(countdown, { replace: true });
    }

    if (count < HOME_OFFLINE_TAPS_REQUIRED) return;

    resetHomeTaps();
    warming.current = true;
    notify("A preparar modo offline…", { replace: true });

    void warmOfflineCache({
      onProgress: ({ done, total }) => {
        if (total > 0 && (done === total || done % 10 === 0)) {
          notify(`A preparar modo offline… ${done}/${total}`, {
            replace: true,
          });
        }
      },
    })
      .then((result) => {
        if (result.ok) {
          notify("Pronto para uso offline.", { replace: true });
        } else {
          notify(result.error ?? "Falha ao preparar o modo offline.", {
            replace: true,
          });
        }
      })
      .finally(() => {
        warming.current = false;
      });
  }, [pathname, notify, resetHomeTaps, scheduleHomeTapReset]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    active: boolean,
    href: string,
  ) => {
    if (href === "/" && active && isHomePath(pathname)) {
      e.preventDefault();
      if (window.scrollY !== 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      handleHomeOfflineGesture();
      return;
    }

    if (active) {
      const isSubRoute = pathname !== href;
      const isAtTop = window.scrollY === 0;

      if (isAtTop && isSubRoute) {
        return;
      }

      e.preventDefault();

      if (!isAtTop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <Nav role="navigation" aria-label="Menu principal">
      {items.map(({ href, label, iconName }) => {
        const active =
          pathname === href || (href !== "/" && pathname.startsWith(href));
        const isCentral = href === "/";

        if (isCentral) {
          return (
            <CentralLink
              as={Link}
              key={href}
              href={href}
              aria-label={label}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                handleNavClick(e, active, href)
              }
            >
              <NavItemWrap>
                <CentralButtonWrap>
                  <CentralButtonIcon name={iconName} alt={label} />
                </CentralButtonWrap>
              </NavItemWrap>
            </CentralLink>
          );
        }

        return (
          <NavLink
            as={Link}
            key={href}
            href={href}
            aria-label={label}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
              handleNavClick(e, active, href)
            }
            $active={active}
          >
            <NavItemWrap>
              <NavIcon name={iconName} alt={label} $active={active} />
            </NavItemWrap>
          </NavLink>
        );
      })}
    </Nav>
  );
}
