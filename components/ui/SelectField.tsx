"use client";

import styled from "styled-components";

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const SelectWrap = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  width: 100%;
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.sm};
  padding-right: 2.25rem;
  appearance: none;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Chevron = styled.span`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  top: 50%;
  width: 0.45rem;
  height: 0.45rem;
  border-right: 2px solid ${({ theme }) => theme.colors.textMuted};
  border-bottom: 2px solid ${({ theme }) => theme.colors.textMuted};
  transform: translateY(-65%) rotate(45deg);
  pointer-events: none;
`;

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
};

export function SelectField({
  id,
  label,
  value,
  onChange,
  children,
}: SelectFieldProps) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <SelectWrap>
        <Select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </Select>
        <Chevron aria-hidden />
      </SelectWrap>
    </Field>
  );
}
