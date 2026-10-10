"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styled from "styled-components";

const Wrapper = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: 1.6;

  & > * + * {
    margin-top: ${({ theme }) => theme.spacing.md};
  }

  /* Parágrafos */
  p {
    margin: 0 0 ${({ theme }) => theme.spacing.sm};
    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Títulos dentro do conteúdo */
  h1,
  h2,
  h3,
  h4 {
    margin: ${({ theme }) => theme.spacing.lg} 0
      ${({ theme }) => theme.spacing.sm};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.3;
  }
  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
  h3,
  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
  h1:first-child,
  h2:first-child,
  h3:first-child,
  h4:first-child {
    margin-top: 0;
  }

  /* Listas */
  ul,
  ol {
    margin: ${({ theme }) => theme.spacing.sm} 0;
    padding-left: 1.5rem;
  }
  li + li {
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
  li > p {
    margin: 0;
  }

  /* Ênfase: **texto** = negrito, *texto* = itálico (formatação MD) */
  strong {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }
  em {
    font-style: italic;
    color: ${({ theme }) => theme.colors.text};
  }
  strong em,
  em strong {
    font-weight: 700;
    font-style: italic;
  }

  /* Blockquote */
  blockquote {
    margin: ${({ theme }) => theme.spacing.md} 0;
    padding: ${({ theme }) => theme.spacing.sm}
      ${({ theme }) => theme.spacing.md};
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
    border-radius: 0 ${({ theme }) => theme.borderRadius}
      ${({ theme }) => theme.borderRadius} 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
  blockquote p:last-child {
    margin-bottom: 0;
  }

  /* Tabelas (GFM) */
  .md-table-wrap {
    overflow-x: auto;
    margin: ${({ theme }) => theme.spacing.md} 0;
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
  th,
  td {
    text-align: left;
    padding: ${({ theme }) => theme.spacing.sm}
      ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  th {
    background: ${({ theme }) => theme.colors.surfaceHover};
    font-weight: 600;
  }
  tr:nth-child(even) td {
    background: rgba(255, 255, 255, 0.02);
  }

  /* Regra horizontal */
  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    margin: ${({ theme }) => theme.spacing.lg} 0;
  }

  /* Código inline */
  code {
    padding: 0.15em 0.4em;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius};
    font-size: 0.9em;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  pre {
    margin: ${({ theme }) => theme.spacing.md} 0;
    padding: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius};
    overflow-x: auto;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
  pre code {
    padding: 0;
    background: none;
    border: none;
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
  a:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

/** Envolve tabelas do markdown em um div para scroll horizontal */
function TableWrapper({
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"table">) {
  return (
    <div className="md-table-wrap">
      <table {...rest}>{children}</table>
    </div>
  );
}

export default function MarkdownContent({ children }: { children: string }) {
  if (!children?.trim()) return null;
  return (
    <Wrapper>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: TableWrapper,
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
        }}
      >
        {children}
      </ReactMarkdown>
    </Wrapper>
  );
}
