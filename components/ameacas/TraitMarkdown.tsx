"use client";

import ReactMarkdown from "react-markdown";
import styled from "styled-components";

const InlineMd = styled.span`
  display: inline;
  font-size: inherit;
  line-height: 1.5;

  p {
    display: inline;
    margin: 0;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }
`;

type Props = { children: string };

export function TraitMarkdown({ children }: Props) {
  if (!children?.trim()) return null;
  return (
    <InlineMd>
      <ReactMarkdown
        components={{
          p: ({ children: c }) => <span>{c}</span>,
          strong: ({ children: c }) => <strong>{c}</strong>,
          em: ({ children: c }) => <em>{c}</em>,
        }}
      >
        {children}
      </ReactMarkdown>
    </InlineMd>
  );
}
