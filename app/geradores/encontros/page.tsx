"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getTabelasIndex, getTabelaById } from "@/lib/tabelas";
import type { TabelaIndexEntry } from "@/lib/tabelas";
import { rollOnTable, type RollTableData } from "@/lib/rollTable";
import {
  classifyEncounterResult,
  buildEncounterFollowUps,
} from "@/lib/encounterFollowUp";
import { regrasTabelaHref } from "@/lib/geradoresConfig";
import { GeneratorLayout } from "@/components/geradores/GeneratorLayout";
import { RollResultCard } from "@/components/geradores/RollResultCard";
import { FilterChips } from "@/components/geradores/FilterChips";
import { FilterPanel, FilterGrid } from "@/components/ui/ListFilters";
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
  margin-right: ${({ theme }) => theme.spacing.sm};
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

type StepResult = { label: string; valor: number; texto: string };

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
  return (
    t.id.startsWith("encontro-") &&
    ![
      "teste-encontro",
      "distancia-inicial-encontro",
      "atividade-criaturas",
      "nivel-perigo",
    ].includes(t.id)
  );
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
  return { label, valor: r.valor, texto: r.texto };
}

async function resolveEncounterFromLocal(
  localTable: RollTableData,
  steps: StepResult[],
  notes: string[],
): Promise<boolean> {
  const r = rollOnTable(localTable);
  steps.push({
    label: "Encontro no local",
    valor: r.valor,
    texto: r.texto,
  });

  const classification = classifyEncounterResult(r.texto);

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

export default function EncontrosPage() {
  const [locais, setLocais] = useState<TabelaIndexEntry[]>([]);
  const [localId, setLocalId] = useState("");
  const [localTable, setLocalTable] = useState<RollTableData | null>(null);
  const [chain, setChain] = useState<StepResult[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [showReacao, setShowReacao] = useState(false);
  const [reacaoTable, setReacaoTable] = useState<RollTableData | null>(null);

  useEffect(() => {
    getTabelasIndex().then((all) => {
      const enc = all.filter(isLocalEncontro);
      setLocais(enc);
      if (enc.length) setLocalId(enc[0].id);
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
    <GeneratorLayout
      title="Encontros"
      description="Bioma → passos do Livro quando aplicam (criaturas, armadilhas, tesouro). Reação à parte."
    >
      <Section>
        <StepTitle>Local / bioma</StepTitle>
        {locais.length === 0 ? (
          <p>Nenhuma tabela de encontro por local migrada.</p>
        ) : (
          <FilterPanel aria-label="Local ou bioma">
            {locais.length <= 6 ? (
              <FilterChips
                options={locais.map((l) => ({ id: l.id, label: l.titulo }))}
                value={localId}
                onChange={setLocalId}
              />
            ) : (
              <FilterGrid $columns={1} $minWidth={0}>
                <SelectField
                  id="encontro-local"
                  label="Local / bioma"
                  value={localId}
                  onChange={setLocalId}
                >
                  {locais.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.titulo}
                    </option>
                  ))}
                </SelectField>
              </FilterGrid>
            )}
          </FilterPanel>
        )}
        <Btn
          type="button"
          disabled={!localTable}
          onClick={() => {
            if (!localTable) return;
            const r = rollOnTable(localTable);
            setChain([
              { label: "Encontro no local", valor: r.valor, texto: r.texto },
            ]);
            setNotes([]);
            setShowReacao(false);
          }}
        >
          Rolar só o local
        </Btn>
      </Section>

      <Section>
        <StepTitle>Cadeia completa</StepTitle>
        <Btn type="button" disabled={!localTable} onClick={() => void runChain()}>
          Rolar cadeia
        </Btn>
        <InlineLink href="/regras/tabelas" style={{ marginLeft: 8 }}>
          Ver tabelas
        </InlineLink>
      </Section>

      {chain.map((s, i) => (
        <RollResultCard key={i} titulo={s.label} valor={s.valor} texto={s.texto} />
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
  );
}
