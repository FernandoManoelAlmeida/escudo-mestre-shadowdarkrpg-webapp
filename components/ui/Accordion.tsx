"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 0;
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const AccordionTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Chevron = styled.span<{ $open: boolean }>`
  flex-shrink: 0;
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid ${({ theme }) => theme.colors.text};
  border-bottom: 2px solid ${({ theme }) => theme.colors.text};
  transform: rotate(${({ $open }) => ($open ? "225deg" : "45deg")});
  transition: transform 0.2s ease;
`;

const AccordionPanel = styled.div<{ $open: boolean }>`
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? "5000px" : "0")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
`;

const AccordionContent = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

type AccordionProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
};

export function Accordion({
  title,
  children,
  defaultOpen = false,
  id,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);
  const panelId = id ? `${id}-panel` : undefined;
  const headerId = id ? `${id}-header` : undefined;

  return (
    <>
      <AccordionHeader
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        id={headerId}
      >
        <AccordionTitle>{title}</AccordionTitle>
        <Chevron $open={open} aria-hidden />
      </AccordionHeader>
      <AccordionPanel
        $open={open}
        id={panelId}
        role="region"
        aria-labelledby={headerId}
      >
        <AccordionContent>{children}</AccordionContent>
      </AccordionPanel>
    </>
  );
}
