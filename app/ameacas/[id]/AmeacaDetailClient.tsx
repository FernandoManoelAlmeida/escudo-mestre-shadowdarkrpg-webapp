"use client";

import { useEffect, useState } from "react";
import { HistoryBackLink } from "@/components/ui/HistoryBackLink";
import styled from "styled-components";
import {
  getAmeacas,
  getAmeacaById,
  fonteParaFicha,
  ameacaDisplayNome,
  type Criatura,
} from "@/lib/ameacas";
import {
  getAmeacasTokens,
  getTokenByAmeacaId,
  type AmeacaToken,
} from "@/lib/ameacasTokens";
import { isCopyrightFree } from "@/lib/copyrightFree";
import { OrigemBadge } from "@/components/ameacas/OrigemBadge";
import { TraitMarkdown } from "@/components/ameacas/TraitMarkdown";
import { extractAllDiceFormulas, rollFormula } from "@/lib/dice";
import { useRollToast } from "@/context/RollToastContext";
import { DiceFormulaIcons } from "@/components/ui/DiceFormulaIcons";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  ariaLabelForRoll,
  parseDiceTokensFromFormula,
} from "@/lib/diceDisplay";

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

const TokenFigure = styled.figure<{ $round?: boolean }>`
  margin: ${({ theme }) => theme.spacing.xl} 0 0;
  padding: 0;
  text-align: center;

  img {
    display: block;
    width: 100%;
    max-width: 280px;
    height: auto;
    margin: 0 auto;
    ${({ $round }) =>
      $round
        ? `
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 50%;
    `
        : ""}
  }

  figcaption {
    margin-top: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    opacity: 0.75;

    a {
      text-decoration: underline;
    }
  }
`;

type Props = { id: string };

export function AmeacaDetailClient({ id }: Props) {
  const [criatura, setCriatura] = useState<Criatura | null | undefined>(
    undefined,
  );
  const [token, setToken] = useState<AmeacaToken | null>(null);
  const [tokenBroken, setTokenBroken] = useState(false);
  const { addRoll } = useRollToast();
  const showTokens = !isCopyrightFree();

  useEffect(() => {
    getAmeacas().then((data) => {
      setCriatura(getAmeacaById(data, id) ?? null);
    });
  }, [id]);

  useEffect(() => {
    if (!showTokens) {
      setToken(null);
      return;
    }
    setTokenBroken(false);
    getAmeacasTokens().then((data) => {
      setToken(getTokenByAmeacaId(data, id) ?? null);
    });
  }, [id, showTokens]);

  if (criatura === undefined) return <PageContainer>Carregando…</PageContainer>;
  if (criatura === null)
    return <PageContainer>Ameaça não encontrada.</PageContainer>;

  const fonteFicha = fonteParaFicha(criatura);

  return (
    <PageContainer>
      <HistoryBackLink href="/ameacas">← Bestiário</HistoryBackLink>
      <h1>{ameacaDisplayNome(criatura.nome, criatura.epitet)}</h1>
      <OrigemBadge origem={criatura.origem} />
      {fonteFicha && (
        <p style={{ opacity: 0.7, fontSize: "0.875rem" }}>{fonteFicha}</p>
      )}
      {criatura.flavor && (
        <p>
          <em>{criatura.flavor}</em>
        </p>
      )}
      <Stats>
        CA {criatura.ca}, PV {criatura.pv}, ATQ {criatura.atq}, MV {criatura.mv},
        F {criatura.atributos.F}, D {criatura.atributos.D}, C{" "}
        {criatura.atributos.C}, I {criatura.atributos.I}, S{" "}
        {criatura.atributos.S}, Car {criatura.atributos.Car}, AL {criatura.al},
        NV {criatura.nv}
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
      {showTokens && token && !tokenBroken && (
        <TokenFigure $round={token.fonte === "community-tokens"}>
          <img
            src={token.url}
            alt={token.rotulo ?? criatura.nome}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setTokenBroken(true)}
          />
          <figcaption>
            Arte:{" "}
            <a
              href={
                token.creditoUrl ??
                "https://foundryvtt.com/packages/shadowdark-community-tokens"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {token.credito ?? "Shadowdark Community Tokens"}
            </a>
          </figcaption>
        </TokenFigure>
      )}
    </PageContainer>
  );
}
