import styled from 'styled-components/native';

export const HeaderContent = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const SectionBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ChipRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
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
