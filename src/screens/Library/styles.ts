import styled from 'styled-components/native';

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const SectionBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const SectionHeaderRow = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const SectionActionRow = styled.View`
  align-items: flex-end;
`;

export const HorizontalScroll = styled.ScrollView`
  margin-right: ${({ theme }) => -theme.layout.screenPadding}px;
`;

export const HorizontalCardShell = styled.View`
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const StatusContent = styled.View`
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;

export const MessageText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const EmptyContent = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const EmptyTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const EmptyDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const EmptyActionRow = styled.View`
  align-items: flex-start;
`;
