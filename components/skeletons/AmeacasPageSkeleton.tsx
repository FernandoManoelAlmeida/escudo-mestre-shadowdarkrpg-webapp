"use client";

import styled from "styled-components";
import { SkeletonBox } from "@/components/ui/Skeleton";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled(SkeletonBox)`
  width: 140px;
  height: 1.75rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FilterPanel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterSection = styled.div`
  &:not(:first-child) {
    margin-top: ${({ theme }) => theme.spacing.md};
    padding-top: ${({ theme }) => theme.spacing.md};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const SearchSkeleton = styled(SkeletonBox)`
  width: 100%;
  height: 44px;
  border-radius: 8px;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: end;
  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const FilterBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`;

const LabelSkeleton = styled(SkeletonBox)`
  width: 72px;
  height: 0.75rem;
`;

const OrderGroup = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
  min-height: 40px;
`;

const DropdownSkeleton = styled(SkeletonBox)`
  width: 100%;
  height: 40px;
  border-radius: 6px;
`;

const ResultCountSkeleton = styled(SkeletonBox)`
  width: 120px;
  height: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Card = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  min-height: 44px;
`;

const CardTitle = styled(SkeletonBox)`
  width: 70%;
  height: 1.125rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CardMeta = styled(SkeletonBox)`
  width: 45%;
  height: 0.875rem;
`;

export function AmeacasPageSkeleton() {
  return (
    <Page>
      <Title aria-hidden />
      <FilterPanel>
        <FilterSection>
          <SearchSkeleton aria-hidden />
        </FilterSection>
        <FilterSection>
          <FilterRow>
            <FilterBlock>
              <LabelSkeleton aria-hidden />
              <OrderGroup>
                <SkeletonBox
                  $width="52px"
                  $height="32px"
                  $radius="6px"
                  aria-hidden
                />
                <SkeletonBox
                  $width="36px"
                  $height="32px"
                  $radius="6px"
                  aria-hidden
                />
              </OrderGroup>
            </FilterBlock>
            <FilterBlock>
              <LabelSkeleton aria-hidden />
              <DropdownSkeleton aria-hidden />
            </FilterBlock>
          </FilterRow>
        </FilterSection>
      </FilterPanel>
      <List>
        <ResultCountSkeleton aria-hidden />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardTitle aria-hidden />
            <CardMeta aria-hidden />
          </Card>
        ))}
      </List>
    </Page>
  );
}
