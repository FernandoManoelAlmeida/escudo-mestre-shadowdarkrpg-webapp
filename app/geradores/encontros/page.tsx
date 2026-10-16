"use client";

import { GeradoresRouteGate } from "@/components/copyright/GeradoresRouteGate";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getTabelasIndex, getTabelaById } from "@/lib/tabelas";
import type { TabelaIndexEntry } from "@/lib/tabelas";
import { rollOnTable, effectiveRolagem, type RollTableData } from "@/lib/rollTable";
import {
  classifyEncounterRow,
  buildEncounterFollowUps,
  type EncounterKind,
} from "@/lib/encounterFollowUp";
import { regrasTabelaHref } from "@/lib/geradoresConfig";
import { GeneratorLayout } from "@/components/geradores/GeneratorLayout";
import {
  GeneratorActionRow,
  GeneratorSecondaryLink,
} from "@/components/geradores/GeneratorActionRow";
import { RollResultCard } from "@/components/geradores/RollResultCard";
import { FilterChips } from "@/components/geradores/FilterChips";
import { FilterClearButton } from "@/components/ui/FilterClearButton";
import {
  FilterPanel,
  FilterGrid,
  FilterPanelClearRow,
} from "@/components/ui/ListFilters";
import { useListFiltersInUrl } from "@/hooks/useListFiltersInUrl";
import { SelectField } from "@/components/ui/SelectField";
import { TabelaRollTableView } from "@/components/geradores/TabelaRollTableView";

const Btn = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.rollButton};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-height: 44px;
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const StepTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Hint = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.45;
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const InlineLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const MissingNote = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

type StepResult = {
  label: string;
  valor: number;
  texto: string;
  faixa?: string;
  diceLabel?: string;
};

function isLocalEncontro(t: TabelaIndexEntry) {
  if (
    [
      "teste-encontro",
      "distancia-inicial-encontro",
      "atividade-criaturas",
      "nivel-perigo",
    ].includes(t.id)
  ) {
    return false;
  }
  return t.id.startsWith("encontro-");
}

function parseFollowUpKind(raw?: string): EncounterKind | undefined {
  if (!raw) return undefined;
  const kinds: EncounterKind[] = [
    "criatura",
    "armadilha",
    "tesouro",
    "item_magico",
    "cena_evento",
    "combinar",
  ];
  return kinds.includes(raw as EncounterKind) ? (raw as EncounterKind) : undefined;
}

async function rollFollowUp(
  tableId: string,
  label: string,
): Promise<StepResult | { missing: string; label: string }> {
  const t = await getTabelaById(tableId);
  if (!t) {
    return {
      missing: `Tabela «${tableId}» não migrada. Consulte ${regrasTabelaHref(tableId)}.`,
      label,
    };
  }
  const r = rollOnTable(t);
  return {
    label,
    valor: r.valor,
    texto: r.texto,
    faixa: r.faixa,
    diceLabel: effectiveRolagem(t),
  };
}

async function resolveEncounterFromLocal(
  localTable: RollTableData,
  steps: StepResult[],
  notes: string[],
): Promise<boolean> {
  const r = rollOnTable(localTable);
  steps.push({
    label: "Encontro",
    valor: r.valor,
    texto: r.texto,
    faixa: r.faixa,
    diceLabel: effectiveRolagem(localTable),
  });

  const classification = classifyEncounterRow(
    r.texto,
    parseFollowUpKind(r.followUp),
  );

  if (classification.kind === "combinar") {
    await resolveEncounterFromLocal(localTable, steps, notes);
    await resolveEncounterFromLocal(localTable, steps, notes);
    return steps.some((s) =>
      ["Distância inicial", "Atividade"].includes(s.label),
    );
  }

  const followUps = buildEncounterFollowUps(classification);
  for (const fu of followUps) {
    const next = await rollFollowUp(fu.tableId, fu.label);
    if ("missing" in next) {
      notes.push(next.missing);
    } else {
      steps.push(next);
    }
  }

  return classification.kind === "criatura";
}

const ENCONTROS_FILTER_DEFAULTS = { local: "" };

export default function EncontrosPage() {
  const [locais, setLocais] = useState<TabelaIndexEntry[]>([]);
  const filterDefaults = useMemo(() => ENCONTROS_FILTER_DEFAULTS, []);
  const { values, setField, clear, hasActive } = useListFiltersInUrl(
    filterDefaults,
    { debouncedKeys: [] },
  );
  const localId = useMemo(() => {
    if (values.local && locais.some((l) => l.id === values.local)) {
      return values.local;
    }
    return locais[0]?.id ?? "";
  }, [values.local, locais]);
  const [localTable, setLocalTable] = useState<RollTableData | null>(null);
  const [chain, setChain] = useState<StepResult[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [showReacao, setShowReacao] = useState(false);
  const [reacaoTable, setReacaoTable] = useState<RollTableData | null>(null);

  useEffect(() => {
    getTabelasIndex().then((all) => {
      setLocais(all.filter(isLocalEncontro));
    });
    getTabelaById("reacao").then(setReacaoTable);
  }, []);

  useEffect(() => {
    if (!localId) return;
    getTabelaById(localId).then(setLocalTable);
  }, [localId]);

  async function runChain() {
    if (!localTable) return;
    const steps: StepResult[] = [];
    const chainNotes: string[] = [];
    const hadCreature = await resolveEncounterFromLocal(
      localTable,
      steps,
      chainNotes,
    );
    setChain(steps);
    setNotes(chainNotes);
    setShowReacao(hadCreature);
  }

  return (
    <GeradoresRouteGate>
    <GeneratorLayout
      title="Encontros"
      description="Escolha o bioma e role o encontro. Distância e atividade só quando a linha pedir; armadilha, tesouro e combinar seguem o Livro."
    >
      <Section>
        <StepTitle>Local / bioma</StepTitle>
        <Hint>
          Cenas urbanas e eventos narrativos param no resultado principal. Para
          criaturas errantes com distância e atividade, use tabelas de exploração
          selvagem ou masmorra. Reação (2d6 + MOD CAR):{" "}
          <InlineLink href="/geradores/reacao">gerador de reação</InlineLink>.
        </Hint>
        {locais.length === 0 ? (
          <p>Nenhuma tabela de encontro por local migrada.</p>
        ) : (
          <FilterPanel aria-label="Local ou bioma">
            {locais.length <= 6 ? (
              <FilterChips
                options={locais.map((l) => ({ id: l.id, label: l.titulo }))}
                value={localId}
                onChange={(id) => setField("local", id)}
              />
            ) : (
              <FilterGrid $columns={1} $minWidth={0}>
                <SelectField
                  id="encontro-local"
                  label="Local / bioma"
                  value={localId}
                  onChange={(id) => setField("local", id)}
                >
                  {locais.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.titulo}
                    </option>
                  ))}
                </SelectField>
              </FilterGrid>
            )}
            <FilterPanelClearRow>
              <FilterClearButton onClick={clear} disabled={!hasActive} />
            </FilterPanelClearRow>
          </FilterPanel>
        )}
        <GeneratorActionRow>
          <Btn
            type="button"
            disabled={!localTable}
            onClick={() => void runChain()}
          >
            Rolar encontro
          </Btn>
          <GeneratorSecondaryLink href="/regras/tabelas">
            Ver tabelas
          </GeneratorSecondaryLink>
        </GeneratorActionRow>
      </Section>

      {chain.map((s, i) => (
        <RollResultCard
          key={i}
          titulo={s.label}
          diceLabel={s.diceLabel}
          valor={s.valor}
          faixa={s.faixa}
          texto={s.texto}
        />
      ))}

      {notes.map((n, i) => (
        <MissingNote key={i}>{n}</MissingNote>
      ))}

      {showReacao && (
        <Section aria-labelledby="reacao-encontro">
          <StepTitle id="reacao-encontro">Reação (criaturas)</StepTitle>
          <Hint>
            Para criaturas errantes: role <strong>2d6 + MOD CAR</strong> no
            gerador de reação (soma o modificador de Carisma de quem
            interage).
          </Hint>
          <InlineLink href="/geradores/reacao">Rolar reação →</InlineLink>
          {reacaoTable && <TabelaRollTableView table={reacaoTable} />}
        </Section>
      )}
    </GeneratorLayout>
  
    </GeradoresRouteGate>
  );
}
