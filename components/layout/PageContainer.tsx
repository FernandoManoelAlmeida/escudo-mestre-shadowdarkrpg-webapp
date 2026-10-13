"use client";

import styled from "styled-components";

/** Conteúdo principal das rotas: coluna centralizada, espaço para BottomNav. */
export const PageContainer = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.contentMaxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;
