"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { RasterIconName } from "@/lib/rasterIcons";
import {
  Nav,
  NavLink,
  NavIcon,
  NavItemWrap,
  CentralButtonWrap,
  CentralButtonIcon,
  CentralLink,
} from "./BottomNav.styles";

const items: { href: string; label: string; iconName: RasterIconName }[] = [
  { href: "/regras", label: "Regras", iconName: "regras-icon" },
  { href: "/geradores", label: "Geradores", iconName: "geradores-icon" },
  { href: "/", label: "Início", iconName: "home-icon" },
  { href: "/ameacas", label: "Ameaças", iconName: "ameacas-icon" },
  { href: "/arcanos", label: "Arcanos", iconName: "itens-magicos-icon" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    active: boolean,
    href: string,
  ) => {
    if (active) {
      const isSubRoute = pathname !== href;
      const isAtTop = window.scrollY === 0;

      // Se estiver no topo e for uma sub-rota, permite navegar para a principal
      if (isAtTop && isSubRoute) {
        return;
      }

      // Caso contrário, previne a navegação padrão
      e.preventDefault();

      // Se não estiver no topo, faz scroll suave
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
