"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import {
  getAmeacas,
  getAmeacaById,
  fonteParaFicha,
  type Criatura,
} from "@/lib/ameacas";
import { OrigemBadge } from "@/components/ameacas/OrigemBadge";
import { TraitMarkdown } from "@/components/ameacas/TraitMarkdown";
import { extractAllDiceFormulas, rollFormula } from "@/lib/dice";
import { useRollToast } from "@/context/RollToastContext";
import { DiceFormulaIcons } from "@/components/ui/DiceFormulaIcons";
import {
  ariaLabelForRoll,
  parseDiceTokensFromFormula,
} from "@/lib/diceDisplay";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

const Stats = styled.p`
  font-family: monospace;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
`;

const Trait = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
`;

const RollBtn = styled.button`
  display: inline-flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing.sm};
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  background: ${({ theme }) => theme.colors.rollButton};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  vertical-align: middle;

  img {
    filter: brightness(0) invert(1);
  }
`;

type Props = { id: string };

export function AmeacaDetailClient({ id }: Props) {
  const [criatura, setCriatura] = useState<Criatura | null | undefined>(
    undefined,
  );
  const { addRoll } = useRollToast();

  useEffect(() => {
    getAmeacas().then((data) => {
      setCriatura(getAmeacaById(data, id) ?? null);
    });
  }, [id]);

  if (criatura === undefined) return <Page>Carregando…</Page>;
  if (criatura === null)
    return <Page>Ameaça não encontrada.</Page>;

  const fonteFicha = fonteParaFicha(criatura);

  return (
    <Page>
      <Link href="/ameacas">← Bestiário</Link>
      <h1>
        {criatura.nome}
        {criatura.epitet ? `, ${criatura.epitet}` : ""}
      </h1>
      <OrigemBadge origem={criatura.origem} />
      {fonteFicha && (
        <p style={{ opacity: 0.7, fontSize: "0.875rem" }}>{fonteFicha}</p>
      )}
      {criatura.flavor && <p><em>{criatura.flavor}</em></p>}
      <Stats>
        CA {criatura.ca}, PV {criatura.pv}, ATQ {criatura.atq}, MV {criatura.mv},
        F {criatura.atributos.F}, D {criatura.atributos.D}, C {criatura.atributos.C},
        I {criatura.atributos.I}, S {criatura.atributos.S}, Car{" "}
        {criatura.atributos.Car}, AL {criatura.al}, NV {criatura.nv}
      </Stats>
      {criatura.tracos.map((t) => (
        <Trait key={t.nome}>
          <strong>{t.nome}.</strong>{" "}
          <TraitMarkdown>{t.descricao}</TraitMarkdown>
          {extractAllDiceFormulas(t.descricao).map((f) => (
            <RollBtn
              key={f}
              type="button"
              aria-label={ariaLabelForRoll(f, "formula")}
              onClick={() => {
                const r = rollFormula(f);
                if (r) addRoll(r);
              }}
            >
              <DiceFormulaIcons
                parsed={parseDiceTokensFromFormula(f)}
                iconSize={16}
              />
            </RollBtn>
          ))}
        </Trait>
      ))}
    </Page>
  );
}
