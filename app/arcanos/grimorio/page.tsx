"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getMagias, type Magia, type SpellLista } from "@/lib/magias";
import {
  CLASS_LABELS,
  collectClassSlugs,
  collectGrauNumbers,
  formatMagiaOrigemLabel,
  formatMagiaRowMeta,
  magiaOrigemSlugs,
  sortMagias,
} from "@/lib/magiasFormat";
import type { OrdenarMagiasPor } from "@/lib/magiasFormat";
import type { SortOrderValue } from "@/lib/sortOrder";
import {
  SortOrderButtons,
  SORT_FIELD_NOME,
  sortFieldGrau,
} from "@/components/ui/SortOrderButtons";
import { SelectField } from "@/components/ui/SelectField";
import {
  FilterPanel,
  FilterSearchInput,
  FilterGrid,
  FilterResultCount,
} from "@/components/ui/ListFilters";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin: ${({ theme }) => theme.spacing.sm} 0 ${({ theme }) => theme.spacing.xs};
`;

const Row = styled(Link)`
  display: block;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHighlight};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Meta = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

function magiaMatchesGrau(m: Magia, classe: string, grauStr: string): boolean {
  if (!grauStr) return true;
  const g = parseInt(grauStr, 10);
  if (classe) {
    return m.grau[classe as SpellLista] === g;
  }
  return Object.values(m.grau).some((n) => n === g);
}

export default function GrimorioPage() {
  const [magias, setMagias] = useState<Magia[]>([]);
  const [busca, setBusca] = useState("");
  const [classe, setClasse] = useState("");
  const [origem, setOrigem] = useState("");
  const [grau, setGrau] = useState("");
  const [ordenar, setOrdenar] = useState<SortOrderValue>({
    por: "nome",
    sentido: "asc",
  });

  useEffect(() => {
    getMagias()
      .then((d) => setMagias(d.magias))
      .catch(() => setMagias([]));
  }, []);

  const classSlugs = useMemo(() => collectClassSlugs(magias), [magias]);
  const graus = useMemo(() => collectGrauNumbers(magias), [magias]);

  const origens = useMemo(() => {
    const set = new Set<string>();
    for (const m of magias) {
      for (const o of magiaOrigemSlugs(m)) set.add(o);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [magias]);

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const list = magias.filter((m) => {
      if (classe && !m.listas.includes(classe as SpellLista)) return false;
      if (origem && !magiaOrigemSlugs(m).includes(origem)) return false;
      if (!magiaMatchesGrau(m, classe, grau)) return false;
      if (!q) return true;
      return (
        m.nome.toLowerCase().includes(q) ||
        m.descricao.toLowerCase().includes(q)
      );
    });
    return sortMagias(list, {
      ordenarPor: ordenar.por as OrdenarMagiasPor,
      ordenarSentido: ordenar.sentido,
      classeFiltro: classe || undefined,
    });
  }, [magias, busca, classe, origem, grau, ordenar]);

  return (
    <Page>
      <p>
        <Link href="/arcanos">← Arcanos</Link>
      </p>
      <Title>Grimório de magias</Title>
      <FilterPanel aria-label="Filtros do grimório">
        <FilterSearchInput
          type="search"
          placeholder="Buscar por nome ou texto…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar magias"
        />
        <FilterGrid $columns={3}>
          <SelectField
            id="grimorio-filtro-classe"
            label="Classe"
            value={classe}
            onChange={setClasse}
          >
            <option value="">Todas</option>
            {classSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {CLASS_LABELS[slug] ?? slug}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="grimorio-filtro-origem"
            label="Origem"
            value={origem}
            onChange={setOrigem}
          >
            <option value="">Todas</option>
            {origens.map((o) => (
              <option key={o} value={o}>
                {formatMagiaOrigemLabel(o)}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="grimorio-filtro-grau"
            label="Grau"
            value={grau}
            onChange={setGrau}
          >
            <option value="">Todos</option>
            {graus.map((n) => (
              <option key={n} value={String(n)}>
                Grau {n}
              </option>
            ))}
          </SelectField>
        </FilterGrid>
        <SortOrderButtons
          fields={[SORT_FIELD_NOME, sortFieldGrau()]}
          value={ordenar}
          onChange={setOrdenar}
        />
      </FilterPanel>
      <FilterResultCount>
        {filtered.length === magias.length
          ? `${filtered.length} magias`
          : `${filtered.length} de ${magias.length} magias`}
      </FilterResultCount>
      {filtered.map((m) => (
        <Row key={m.id} href={`/arcanos/grimorio/${m.id}`}>
          <strong>{m.nome}</strong>
          <Meta>{formatMagiaRowMeta(m)}</Meta>
        </Row>
      ))}
    </Page>
  );
}
