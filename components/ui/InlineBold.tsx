"use client";

import type { ReactNode, JSX } from "react";

/**
 * Converte texto com asteriscos em nós React: **texto** e *texto* são renderizados como negrito.
 * Usado nas telas de Regras (glossário, tabelas) para exibir termos como "**Personagem / Agente**".
 */
export function parseAsterisksAsBold(text: string): ReactNode[] {
  if (typeof text !== "string" || !text) return [];
  const nodes: ReactNode[] = [];
  // **...** (dois) ou *...* (um) → negrito; processar ** primeiro para não confundir com *
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const content = m[1] ?? m[2];
    if (lastIndex < m.index) {
      nodes.push(text.slice(lastIndex, m.index));
    }
    nodes.push(<strong key={key++}>{content}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes.length > 0 ? nodes : [text];
}

interface InlineBoldProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Componente inline que renderiza ** e * como negrito (para termo, fullName, células de tabela).
 */
export default function InlineBold({
  children,
  as: Component = "span",
}: InlineBoldProps) {
  const content = parseAsterisksAsBold(children);
  return <Component>{content}</Component>;
}
