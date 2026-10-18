import styled from 'styled-components/native';

export const Content = styled.View`
  padding: ${({ theme }) => theme.layout.screenPadding}px;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;
export const CardContent = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;
