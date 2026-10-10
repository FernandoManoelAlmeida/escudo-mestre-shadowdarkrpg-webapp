"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getTabelaById } from "@/lib/tabelas";
import type { RollTableData } from "@/lib/rollTable";
import { effectiveRolagem, rollOnTable } from "@/lib/rollTable";
import {
  TABLE_IDS,
  POI_TABLE_BY_DISTRITO,
  gerarAssentamento,
  rollTipoAssentamento,
  rollDistritos,
  rollPoiOnTable,
  poiTableIdForDistrito,
  type AssentamentoGerado,
} from "@/lib/assentamentosGenerator";
import { regrasTabelaHref } from "@/lib/geradoresConfig";
import { GeneratorLayout } from "@/components/geradores/GeneratorLayout";
import {
  GeneratorActionRow,
  GeneratorSecondaryLink,
} from "@/components/geradores/GeneratorActionRow";
import { RollResultCard } from "@/components/geradores/RollResultCard";

const Btn = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.rollButton};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-height: 44px;
`;

const BtnSecondary = styled(Btn)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
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

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  cursor: pointer;
`;

const InlineLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const PoiLink = styled(Link)`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
`;

const ActionStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export default function AssentamentosPage() {
  const [tipoTable, setTipoTable] = useState<RollTableData | null>(null);
  const [distritoTable, setDistritoTable] = useState<RollTableData | null>(null);
  const [alinhamentoTable, setAlinhamentoTable] =
    useState<RollTableData | null>(null);
  const [nomeTable, setNomeTable] = useState<RollTableData | null>(null);
  const [poiTables, setPoiTables] = useState<Record<string, RollTableData>>({});
  const [alinhamentoPorDistrito, setAlinhamentoPorDistrito] = useState(false);
  const [incluirNome, setIncluirNome] = useState(true);
  const [result, setResult] = useState<AssentamentoGerado | null>(null);
  const [tipoOnly, setTipoOnly] = useState<ReturnType<
    typeof rollTipoAssentamento
  > | null>(null);

  useEffect(() => {
    void (async () => {
      const [tipo, distrito, alinhamento, nome] = await Promise.all([
        getTabelaById(TABLE_IDS.tipo),
        getTabelaById(TABLE_IDS.distrito),
        getTabelaById(TABLE_IDS.alinhamento),
        getTabelaById(TABLE_IDS.nomeExemplos),
      ]);
      setTipoTable(tipo);
      setDistritoTable(distrito);
      setAlinhamentoTable(alinhamento);
      setNomeTable(nome);

      const poiEntries = await Promise.all(
        Object.values(POI_TABLE_BY_DISTRITO).map(async (id) => {
          const t = await getTabelaById(id);
          return [id, t] as const;
        }),
      );
      const map: Record<string, RollTableData> = {};
      for (const [id, t] of poiEntries) {
        if (t) map[id] = t;
      }
      setPoiTables(map);
    })();
  }, []);

  const tablesReady =
    tipoTable && distritoTable && alinhamentoTable && Object.keys(poiTables).length > 0;

  const runFull = useCallback(() => {
    if (!tipoTable || !distritoTable || !alinhamentoTable) return;
    const gen = gerarAssentamento(
      {
        tipoTable,
        distritoTable,
        alinhamentoTable,
        nomeTable: incluirNome ? nomeTable : null,
        poiTables,
      },
      { alinhamentoPorDistrito, incluirNome },
    );
    setResult(gen);
    setTipoOnly(null);
  }, [
    tipoTable,
    distritoTable,
    alinhamentoTable,
    nomeTable,
    poiTables,
    alinhamentoPorDistrito,
    incluirNome,
  ]);

  const runTipoOnly = useCallback(() => {
    if (!tipoTable) return;
    setTipoOnly(rollTipoAssentamento(tipoTable));
    setResult(null);
  }, [tipoTable]);

  const runUmDistrito = useCallback(() => {
    if (!distritoTable || !alinhamentoTable) return;
    const distritos = rollDistritos(1, distritoTable);
    const d0 = distritos[0];
    const poiId = d0 ? poiTableIdForDistrito(d0.nome) : null;
    const poiTable = poiId ? poiTables[poiId] : undefined;
    setResult({
      tipo: {
        valor: 0,
        faixa: "—",
        tipo: "(prep rápida)",
        diceFormula: "—",
        diceCount: 1,
      },
      distritos: distritos.map((d) => ({
        ...d,
        pois: poiTable ? [rollPoiOnTable(poiTable)] : [],
      })),
      governoIndex: 0,
      alinhamentoGeral: rollOnTable(alinhamentoTable).texto,
    });
    setTipoOnly(null);
  }, [distritoTable, alinhamentoTable, poiTables]);

  return (
    <GeneratorLayout
      title="Assentamentos"
      description="Tipo, distritos no mapa (pool de dados), alinhamento e um POI por distrito. No Livro: jogue os dados no papel, desenhe o contorno e role 1d4 POIs por distrito na mesa."
    >
      <Section>
        <StepTitle>Opções</StepTitle>
        <CheckRow>
          <input
            type="checkbox"
            checked={alinhamentoPorDistrito}
            onChange={(e) => setAlinhamentoPorDistrito(e.target.checked)}
          />
          Alinhamento por distrito (senão, um para todo o assentamento)
        </CheckRow>
        <CheckRow>
          <input
            type="checkbox"
            checked={incluirNome}
            onChange={(e) => setIncluirNome(e.target.checked)}
          />
          Incluir nome (exemplos d20 + d4 na coluna)
        </CheckRow>
        <Hint>
          Mapa físico: role o pool indicado no tipo (ex. 4d4), marque cada dado,
          trace o contorno e use o valor de cada dado como distrito (d8). A sede
          do governo fica no distrito com a face mais alta.{" "}
          <InlineLink href={regrasTabelaHref(TABLE_IDS.tipo)}>
            Ver tabelas
          </InlineLink>
          .
        </Hint>
        <GeneratorActionRow>
          <ActionStack>
            <Btn type="button" disabled={!tablesReady} onClick={() => runFull()}>
              Gerar assentamento
            </Btn>
            <BtnSecondary
              type="button"
              disabled={!tipoTable}
              onClick={() => runTipoOnly()}
            >
              Só tipo
            </BtnSecondary>
            <BtnSecondary
              type="button"
              disabled={!distritoTable}
              onClick={() => runUmDistrito()}
            >
              Só um distrito
            </BtnSecondary>
          </ActionStack>
          <GeneratorSecondaryLink href={regrasTabelaHref(TABLE_IDS.tipo)}>
            Ver tabela do tipo
          </GeneratorSecondaryLink>
        </GeneratorActionRow>
      </Section>

      {tipoOnly && tipoTable && (
        <RollResultCard
          titulo="Tipo de assentamento"
          diceLabel={effectiveRolagem(tipoTable)}
          valor={tipoOnly.valor}
          faixa={tipoOnly.faixa}
          texto={`${tipoOnly.tipo} — jogue ${tipoOnly.diceFormula} no mapa (${tipoOnly.diceCount} dados)`}
        />
      )}

      {result?.nome && (
        <RollResultCard titulo="Nome" texto={result.nome} />
      )}

      {result && result.tipo.tipo !== "(prep rápida)" && tipoTable && (
        <RollResultCard
          titulo="Tipo de assentamento"
          diceLabel={effectiveRolagem(tipoTable)}
          valor={result.tipo.valor}
          faixa={result.tipo.faixa}
          texto={`${result.tipo.tipo} — pool ${result.tipo.diceFormula} (${result.tipo.diceCount} distritos)`}
        />
      )}

      {result?.alinhamentoGeral && (
        <RollResultCard
          titulo="Alinhamento geral"
          texto={result.alinhamentoGeral}
        />
      )}

      {result?.distritos.map((d, i) => {
        const gov =
          result.governoIndex === i ? " · Sede do governo" : "";
        const align = d.alinhamento ? `Alinhamento: ${d.alinhamento}. ` : "";
        const poi = d.pois[0]?.texto ?? "Sem tabela de POI.";
        const texto = `${align}${poi}${gov}`;
        const link = d.pois[0]?.linkHref;
        const linkLabel = d.pois[0]?.linkLabel;
        return (
          <div key={i}>
            <RollResultCard
              titulo={`Distrito ${i + 1}: ${d.nome}`}
              diceLabel="d8 + face d8"
              valor={d.valor}
              faixa={`distrito ${d.faixa} · face ${d.face}`}
              texto={texto}
            />
            {link && linkLabel && (
              <PoiLink href={link}>{linkLabel}</PoiLink>
            )}
          </div>
        );
      })}

      {result && result.tipo.diceCount > 0 && (
        <Hint>
          Livro: cada distrito tem 1d4 pontos de interesse principais — aqui
          mostramos 1 POI por distrito; role de novo na tabela do distrito se
          precisar de mais.
        </Hint>
      )}
    </GeneratorLayout>
  );
}
