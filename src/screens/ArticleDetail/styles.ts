import styled, { css } from 'styled-components/native';
import type { ArticleCategory } from '../../features/articles/types/article';

const visualStyles = {
  TIPS: css`
    background-color: ${({ theme }) => theme.colors.primarySoft};
  `,
  STORAGE: css`
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  `,
  SEASONALITY: css`
    background-color: ${({ theme }) => theme.colors.surfaceMuted};
  `,
  RECIPES: css`
    background-color: ${({ theme }) => theme.colors.primarySoft};
  `,
  WASTE_REDUCTION: css`
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  `,
};

export const Content = styled.View`
  gap: ${({ theme }) => theme.layout.sectionGap}px;
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

export const HeroCard = styled.View<{ $category: ArticleCategory }>`
  overflow: hidden;
  min-height: 200px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  justify-content: space-between;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  ${({ $category }) => visualStyles[$category]}
`;

export const HeroImage = styled.Image.attrs({
  resizeMode: 'cover',
})`
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
`;

export const HeroOverlay = styled.View`
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

export const MetaTopRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const MetaTopRight = styled.View`
  align-items: flex-end;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CategoryPill = styled.View`
  align-self: flex-start;
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
`;

export const CategoryPillText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const HeroFallbackBadge = styled.View`
  align-self: flex-end;
  width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.full}px;
`;

export const HeroFallbackBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.headingSm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingSm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const HeroCopy = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const HeroTitle = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.headingLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingLg.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingLg.fontWeight};
`;

export const HeroSummary = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
`;

export const MetaCard = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const AuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const AuthorCopy = styled.View`
  flex: 1;
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
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const MetaInfoChip = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
`;

export const MetaInfoText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ContentCard = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Paragraph = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: 28px;
`;

export const TagsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const TagChip = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
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
