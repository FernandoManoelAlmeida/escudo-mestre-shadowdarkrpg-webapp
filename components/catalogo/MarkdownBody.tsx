"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styled from "styled-components";

const Body = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};

  p {
    margin: 0 0 ${({ theme }) => theme.spacing.sm};
  }

  strong {
    font-weight: 600;
  }
`;

type Props = { children: string };

export function MarkdownBody({ children }: Props) {
  const text = children.trim();
  if (!text) return null;
  if (!/[*_#`\[]/.test(text)) {
    return <Body as="pre" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{text}</Body>;
  }
  return (
    <Body>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </Body>
  );
}
