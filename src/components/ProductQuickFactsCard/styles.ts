import styled from 'styled-components/native';

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const HighlightRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const HighlightChip = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
`;

export const HighlightText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
