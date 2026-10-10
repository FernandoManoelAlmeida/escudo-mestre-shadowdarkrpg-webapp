"use client";

import styled from "styled-components";
import { REGRAS_CASA_RESUMO } from "@/lib/regrasCasaResumo";
import { SolodarkOracleWidget } from "@/components/home/SolodarkOracleWidget";

const GITHUB_WEBAPP_URL =
  "https://github.com/FernandoManoelAlmeida/escudo-mestre-shadowdarkrpg-webapp";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const TitleLink = styled.a`
  display: block;
  text-align: center;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.borderHighlight};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  width: 100%;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 4px;
  }
`;

const HomeTitle = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.primary};
`;

const HomeSubtitle = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Description = styled.div`
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.6;

  p {
    margin: 0 0 ${({ theme }) => theme.spacing.md};
  }
  p:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const RegrasSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const RegrasList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
    align-items: stretch;
  }
`;

const RegraItem = styled.li`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  flex-direction: column;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    height: 100%;
    transition:
      border-color 0.2s,
      background-color 0.2s;

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      background: ${({ theme }) => theme.colors.surfaceHover};
    }

    &:last-child:nth-child(odd) {
      grid-column: span 2;
    }
  }
`;

const RegraTitulo = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const RegraRef = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: ${({ theme }) => theme.spacing.xs};
`;

const RegraDescricao = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

const LicenseFooter = styled.footer`
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SHADOWDARK_FAN_URL =
  "https://thearcanelibrary.com/pages/shadowdark-rpg-third-party-license";

export default function Home() {
  return (
    <Page>
      <TitleRow>
        <TitleLink
          href={GITHUB_WEBAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir repositório do Escudo Shadowdark no GitHub"
        >
          <HomeTitle>Escudo do Mestre</HomeTitle>
          <HomeSubtitle>Shadowdark RPG — Mundo Fraturado</HomeSubtitle>
        </TitleLink>
      </TitleRow>

      <SolodarkOracleWidget />

      <Description>
        <p>
          Este é um <strong>Escudo do Mestre</strong> feito de fã para fã: uma
          referência rápida para mestrar sessões de Shadowdark no setting
          Fantasia.
        </p>
        <p>
          Regras curadas, bestiário, geradores de mesa e tabelas — pensado para
          uso no telemóvel durante o jogo. Conteúdo derivado do vault{" "}
          <strong>shadowdarkrpg-fantasia</strong> (homebrews e compêndio da
          mesa).
        </p>
        <p>
          Apoie o RPG oficial: adquira o Livro de Regras Shadowdark e
          suplementos licenciados.
        </p>
      </Description>

      <RegrasSection aria-labelledby="regras-em-uso">
        <SectionTitle id="regras-em-uso">Regras em uso</SectionTitle>
        <RegrasList aria-label="Resumo das regras da mesa">
          {REGRAS_CASA_RESUMO.map((regra, index) => (
            <RegraItem key={index}>
              <RegraTitulo>
                {regra.titulo}
                {regra.referencia && <RegraRef>({regra.referencia})</RegraRef>}
              </RegraTitulo>
              <RegraDescricao>{regra.descricao}</RegraDescricao>
            </RegraItem>
          ))}
        </RegrasList>
      </RegrasSection>

      <LicenseFooter id="licenca">
        <SectionTitle>Licença</SectionTitle>
        <p>
          Ferramenta de fã para Shadowdark RPG. Não afiliada à The Arcane Library.
          Shadowdark RPG © The Arcane Library LLC. Consulte a{" "}
          <a
            href={SHADOWDARK_FAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Política de conteúdo de terceiros Shadowdark (nova aba)"
          >
            política de conteúdo de terceiros
          </a>
          .
        </p>
      </LicenseFooter>
    </Page>
  );
}
