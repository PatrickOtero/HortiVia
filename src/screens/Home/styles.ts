import styled from 'styled-components/native';

export const HeaderContent = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const HeaderRow = styled.View`
  align-items: flex-start;
`;

export const SectionBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const FooterBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
`;

export const FooterHeaderRow = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const FooterContent = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const SectionHeaderContent = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const SectionHeaderActionRow = styled.View`
  align-items: flex-end;
`;

export const ChipRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const HorizontalScroll = styled.ScrollView`
  margin-right: ${({ theme }) => -theme.layout.screenPadding}px;
`;

export const HorizontalCardShell = styled.View`
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const ArticlePreviewStack = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const SectionMessage = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
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
