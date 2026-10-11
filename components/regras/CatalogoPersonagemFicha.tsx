"use client";

import styled from "styled-components";
import MarkdownContent from "@/components/ui/MarkdownContent";
import {
  type CatalogoDescricaoKind,
  repairCollapsedMarkdown,
  splitCatalogoMarkdownSections,
} from "@/lib/catalogoMarkdown";

const Intro = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: 1.6;
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
`;

type Props = {
  descricao: string;
  descricaoKind?: CatalogoDescricaoKind;
};

export function CatalogoPersonagemFicha({
  descricao,
  descricaoKind = "ancestralidade",
}: Props) {
  const { intro, sections } = splitCatalogoMarkdownSections(descricao, descricaoKind);

  if (sections.length === 0) {
    return (
      <MarkdownContent>{repairCollapsedMarkdown(descricao)}</MarkdownContent>
    );
  }

  return (
    <>
      {intro ? (
        <Intro>
          <MarkdownContent>{intro}</MarkdownContent>
        </Intro>
      ) : null}
      {sections.map((sec) => (
        <Section key={sec.id} aria-labelledby={`ficha-sec-${sec.id}`}>
          <SectionTitle id={`ficha-sec-${sec.id}`}>{sec.title}</SectionTitle>
          <MarkdownContent>{sec.body}</MarkdownContent>
        </Section>
      ))}
    </>
  );
}
