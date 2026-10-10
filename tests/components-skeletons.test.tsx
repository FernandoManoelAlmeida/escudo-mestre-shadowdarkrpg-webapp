import { describe, it, expect } from "vitest";
import type { ComponentType } from "react";
import { renderWithTheme } from "./utils/render-theme";
import {
  HomePageSkeleton,
  AmeacasPageSkeleton,
  AmeacaDetailSkeleton,
  RegrasPageSkeleton,
  RegrasSectionSkeleton,
  RegrasTabelasSkeleton,
  RegrasGlossarioSkeleton,
} from "@/components/skeletons";
import HomeLoading from "@/app/loading";
import AmeacasLoading from "@/app/ameacas/loading";
import AmeacaDetailLoading from "@/app/ameacas/[id]/loading";
import RegrasLoading from "@/app/regras/loading";
import RegrasSectionLoading from "@/app/regras/[sectionId]/loading";
import RegrasTabelasLoading from "@/app/regras/tabelas/loading";
import RegrasGlossarioLoading from "@/app/regras/glossario/loading";
describe("skeletons e loadings", () => {
  const skeletonCases: [string, ComponentType][] = [
    ["HomePageSkeleton", HomePageSkeleton],
    ["AmeacasPageSkeleton", AmeacasPageSkeleton],
    ["AmeacaDetailSkeleton", AmeacaDetailSkeleton],
    ["RegrasPageSkeleton", RegrasPageSkeleton],
    ["RegrasSectionSkeleton", RegrasSectionSkeleton],
    ["RegrasTabelasSkeleton", RegrasTabelasSkeleton],
    ["RegrasGlossarioSkeleton", RegrasGlossarioSkeleton],
  ];

  it.each(skeletonCases)("%s renderiza", (_name, Comp) => {
    const { container } = renderWithTheme(<Comp />);
    expect(container.firstChild).toBeTruthy();
  });

  const loadingCases: [string, ComponentType][] = [
    ["app/loading", HomeLoading],
    ["ameacas/loading", AmeacasLoading],
    ["ameacas/[id]/loading", AmeacaDetailLoading],
    ["regras/loading", RegrasLoading],
    ["regras/[sectionId]/loading", RegrasSectionLoading],
    ["regras/tabelas/loading", RegrasTabelasLoading],
    ["regras/glossario/loading", RegrasGlossarioLoading],
  ];

  it.each(loadingCases)("%s renderiza", (_path, Comp) => {
    const { container } = renderWithTheme(<Comp />);
    expect(container.firstChild).toBeTruthy();
  });
});
