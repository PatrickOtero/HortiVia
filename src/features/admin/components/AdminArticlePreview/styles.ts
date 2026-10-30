import styled from 'styled-components/native';

export const Container = styled.View.attrs({
  accessibilityLabel: 'Pré-visualização do artigo',
})`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const PreviewHeading = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.headingMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingMd.fontWeight};
`;

export const PreviewDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const CoverImage = styled.Image.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  aspect-ratio: 1.5;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

export const MetaRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const MetaPill = styled.View<{ $status?: boolean }>`
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme, $status }) =>
    $status ? theme.colors.borderStrong : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme, $status }) =>
    $status ? theme.colors.primarySoft : theme.colors.surfaceMuted};
`;

export const MetaText = styled.Text<{ $status?: boolean }>`
  color: ${({ theme, $status }) =>
    $status ? theme.colors.primaryStrong : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ArticleTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
`;

export const Summary = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: 26px;
`;

export const Author = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const TagList = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Tag = styled.Text`
  overflow: hidden;
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

export const Body = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
  padding-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const LegacyParagraph = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: 28px;
`;
