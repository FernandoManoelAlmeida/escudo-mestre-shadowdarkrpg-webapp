"use client";

import styled from "styled-components";
import { SkeletonBox } from "@/components/ui/Skeleton";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
`;

const BackLink = styled(SkeletonBox)`
  width: 100px;
  height: 1rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Sheet = styled.article`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary}22 0%,
    ${({ theme }) => theme.colors.surface} 100%
  );
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
`;

const HeaderText = styled.div`
  flex: 1;
  min-width: 0;
`;

const Block = styled.section`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-of-type {
    border-bottom: none;
  }
`;

const HeaderTitleSkeleton = styled(SkeletonBox)`
  width: 65%;
  height: 1.75rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BlockTitle = styled(SkeletonBox)`
  width: 120px;
  height: 1.125rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Line = styled(SkeletonBox)`
  height: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export function AmeacaDetailSkeleton() {
  return (
    <Page>
      <BackLink aria-hidden />
      <Sheet>
        <Header>
          <HeaderText>
            <HeaderTitleSkeleton aria-hidden />
            <SkeletonBox
              $width="50%"
              $height="0.875rem"
              $radius="4px"
              aria-hidden
            />
          </HeaderText>
          <SkeletonBox $width="48px" $height="48px" $radius="4px" aria-hidden />
        </Header>
        <Block>
          <BlockTitle aria-hidden />
          <Line $width="100%" aria-hidden />
          <Line $width="95%" aria-hidden />
          <Line $width="80%" aria-hidden />
        </Block>
        <Block>
          <BlockTitle aria-hidden />
          <Line $width="90%" aria-hidden />
          <Line $width="70%" aria-hidden />
          <Line $width="85%" aria-hidden />
        </Block>
        <Block>
          <BlockTitle aria-hidden />
          <Line $width="100%" aria-hidden />
          <Line $width="60%" aria-hidden />
        </Block>
      </Sheet>
    </Page>
  );
}
