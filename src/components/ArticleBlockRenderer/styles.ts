import styled, { css } from 'styled-components/native';

export const BlockContainer = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const SectionBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const HeadingText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.headingMd.fontSize}px;
  line-height: 28px;
  font-weight: ${({ theme }) => theme.typography.headingMd.fontWeight};
`;

export const SectionHeading = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.headingSm.fontSize}px;
  line-height: 24px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const BodyText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: 30px;
`;

export const MediaBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const MediaWrapper = styled.View``;

export const MediaImage = styled.Image.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: 220px;
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

export const ImageCaption = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: 20px;
`;

const highlightStyles = {
  tip: css`
    background-color: ${({ theme }) => theme.colors.primarySoft};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  `,
  warning: css`
    background-color: rgba(199, 150, 34, 0.12);
    border-color: rgba(199, 150, 34, 0.28);
  `,
};

export const HighlightBlock = styled.View<{ $tone: 'tip' | 'warning' }>`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.xl}px;
  ${({ $tone }) => highlightStyles[$tone]}
`;

export const HighlightLabel = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const List = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ListItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ListBulletText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: 24px;
`;

export const CheckIndicator = styled.View`
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
`;

export const CheckText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const StepBadge = styled.View`
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.full}px;
`;

export const StepBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ListItemText = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: 24px;
`;

export const QuoteBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-left-width: 3px;
  border-left-color: ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const QuoteText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: 30px;
  font-weight: ${({ theme }) => theme.typography.bodyLg.fontWeight};
`;

export const QuoteSource = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;
