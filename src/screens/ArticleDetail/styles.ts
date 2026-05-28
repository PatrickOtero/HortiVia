import styled from 'styled-components/native';

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

export const StatusContent = styled.View`
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;

export const HeroMedia = styled.View`
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

export const HeroImage = styled.Image.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: 100%;
`;

export const HeroFallback = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const HeroFallbackBadge = styled.View`
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const HeroFallbackBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.headingMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingMd.fontWeight};
`;

export const HeroFallbackText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const IntroCard = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const IntroTopRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const CategoryPill = styled.View`
  align-self: flex-start;
  max-width: 68%;
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
`;

export const CategoryPillText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const IntroCopy = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const UtilityRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const UtilityCopy = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const UtilityTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const UtilityDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
`;

export const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: 26px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const Summary = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: 22px;
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

export const MetaRow = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const AuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const AuthorCopy = styled.View`
  flex: 1;
  min-width: 0px;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const AuthorName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const AuthorLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

export const MetaInfoWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const MetaInfoChip = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const MetaInfoText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const BodySection = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
`;

export const BlocksList = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const Paragraph = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: 30px;
`;

export const TagsCard = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const TagsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const TagChip = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
`;

export const TagText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const RelatedSectionCard = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const RelatedScroll = styled.ScrollView`
  margin-right: ${({ theme }) => -theme.layout.screenPadding}px;
`;

export const RelatedCardShell = styled.View`
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;
