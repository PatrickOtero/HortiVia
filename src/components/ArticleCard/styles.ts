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

export const CardButton = styled.TouchableOpacity`
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 8px;
  shadow-opacity: 1;
  shadow-radius: 18px;
  elevation: ${({ theme }) => theme.elevation.card};
`;

export const VisualArea = styled.View<{ $category: ArticleCategory }>`
  overflow: hidden;
  min-height: 118px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  justify-content: space-between;
  ${({ $category }) => visualStyles[$category]}
`;

export const VisualImage = styled.Image.attrs({
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

export const VisualOverlay = styled.View`
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  background-color: ${({ theme }) => theme.colors.overlay};
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

export const VisualTitle = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.headingSm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingSm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingSm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingSm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const Summary = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const AuthorRow = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const AuthorCopy = styled.View`
  flex: 1;
`;

export const AuthorName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const DateRow = styled.View`
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const MetaText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;
