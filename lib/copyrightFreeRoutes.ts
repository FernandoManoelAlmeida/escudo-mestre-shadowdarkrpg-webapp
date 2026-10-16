import { isCopyrightFree } from "@/lib/copyrightFree";
import { getAncestralidades } from "@/lib/ancestralidades";
import { getAntecedentes } from "@/lib/antecedentes";
import { getClasses } from "@/lib/classes";

function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Rotas sem conteúdo útil quando COPYRIGHT_FREE=1 (tabelas / glossário / geradores). */
export function isCopyrightFreeRouteEnabled(pathname: string): boolean {
  if (!isCopyrightFree()) return true;
  const p = normalizePath(pathname);
  if (p === "/regras/tabelas" || p.startsWith("/regras/tabelas/")) return false;
  if (p === "/regras/glossario" || p.startsWith("/regras/glossario/")) {
    return false;
  }
  if (p === "/geradores" || p.startsWith("/geradores/")) return false;
  return true;
}

export function areGeradoresEnabled(): boolean {
  return isCopyrightFreeRouteEnabled("/geradores");
}

export type CatalogoPersonagemKind =
  | "classes"
  | "ancestralidades"
  | "antecedentes";

export async function isCatalogoPersonagemRouteEnabled(
  kind: CatalogoPersonagemKind,
): Promise<boolean> {
  if (!isCopyrightFree()) return true;
  if (kind === "classes") return (await getClasses()).length > 0;
  if (kind === "ancestralidades") {
    return (await getAncestralidades()).length > 0;
  }
  return (await getAntecedentes()).length > 0;
}
