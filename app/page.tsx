"use client";

import styled from "styled-components";
import { REGRAS_CASA_RESUMO } from "@/lib/regrasCasaResumo";
import { SolodarkOracleWidget } from "@/components/home/SolodarkOracleWidget";
import { AstraldarkPdfBanner } from "@/components/home/AstraldarkPdfBanner";
import { assetUrl } from "@/lib/basePath";
import { PageContainer } from "@/components/layout/PageContainer";
import { isCopyrightFree } from "@/lib/copyrightFree";
import { ShadowdarkMastershieldWordmark } from "@/components/branding/ShadowdarkMastershieldWordmark";

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const TitleBrand = styled.div`
  display: block;
  text-align: center;
  width: 100%;
`;

const ThirdPartyLogo = styled.img`
  display: block;
  width: 100%;
  max-width: 420px;
  height: auto;
  margin: 0 auto;
`;

const Description = styled.div`
  color: ${({ theme }) => theme.colors.text};
  margin: ${({ theme }) => theme.spacing.xl} 0;
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

const PromoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.lg} 0;

  & > * {
    min-width: 0;
  }

  & > section {
    margin: 0;
  }

  & > a {
    margin: 0;
    max-width: none;
    height: 100%;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
    align-items: stretch;
  }
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
  "https://www.thearcanelibrary.com/blogs/shadowdark-blog/faq-on-the-shadowdark-rpg-third-party-license";

export default function Home() {
  const copyrightFree = isCopyrightFree();

  return (
    <PageContainer>
      <TitleRow>
        <TitleBrand>
          {copyrightFree ? (
            <ThirdPartyLogo
              src={assetUrl("/branding/third-party-shadowdark-logo-white.png")}
              alt="Designed for use with Shadowdark RPG"
              width={2066}
              height={852}
              decoding="async"
            />
          ) : (
            <ShadowdarkMastershieldWordmark />
          )}
        </TitleBrand>
      </TitleRow>

      <Description>
        <p>
          Este é um <strong>Escudo do Mestre</strong> feito de fã para fã: uma
          referência rápida para mestrar sessões de Shadowdark RPG.
        </p>
        <p>Regras curadas, bestiário, geradores de mesa e tabelas.</p>
        <p>
          Apoie o RPG oficial: adquira o Livro de Regras Shadowdark e
          suplementos licenciados.
        </p>
      </Description>

      <PromoRow>
        <SolodarkOracleWidget />
        <AstraldarkPdfBanner />
      </PromoRow>

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
        {copyrightFree ? (
          <p>
            Escudo do Mestre Shadowdark is an independent product published under
            the Shadowdark RPG Third-Party License and is not affiliated with The
            Arcane Library, LLC. Shadowdark RPG © 2023 The Arcane Library, LLC.
            Consulte a{" "}
            <a
              href={SHADOWDARK_FAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FAQ da Third-Party License Shadowdark (nova aba)"
            >
              FAQ da Third-Party License
            </a>
            .
          </p>
        ) : (
          <p>
            Ferramenta de fã para Shadowdark RPG (uso de mesa). Este build pode
            incluir conteúdo de terceiros fora da Third-Party License (ex.
            tokens{" "}
            <a
              href="https://youseethis.blog/tokens/"
              target="_blank"
              rel="noopener noreferrer"
            >
              You see this
            </a>
            ). Não afiliada à The Arcane Library. Shadowdark RPG © The Arcane
            Library LLC.{" "}
            <a
              href={SHADOWDARK_FAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FAQ da Third-Party License Shadowdark (nova aba)"
            >
              FAQ da licença
            </a>
            .
          </p>
        )}
      </LicenseFooter>
    </PageContainer>
  );
}
