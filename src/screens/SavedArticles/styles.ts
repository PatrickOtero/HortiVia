import styled from 'styled-components/native';

export const HeaderContent = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const IntroPanel = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const ListSpacer = styled.View`
  height: ${({ theme }) => theme.spacing.md}px;
`;

export const StatusContent = styled.View`
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;
