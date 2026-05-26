import styled, { css } from 'styled-components/native';
import type { ProductCategory } from '../../features/products/types/product';

const categoryShellStyles = {
  FRUIT: css`
    background-color: ${({ theme }) => theme.colors.primarySoft};
  `,
  VEGETABLE: css`
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  `,
  LEGUME: css`
    background-color: ${({ theme }) => theme.colors.surfaceMuted};
  `,
};

const categoryTagStyles = {
  FRUIT: css`
    background-color: ${({ theme }) => theme.colors.primarySoft};
    border-color: ${({ theme }) => theme.colors.border};
  `,
  VEGETABLE: css`
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    border-color: ${({ theme }) => theme.colors.border};
  `,
  LEGUME: css`
    background-color: ${({ theme }) => theme.colors.surfaceMuted};
    border-color: ${({ theme }) => theme.colors.border};
  `,
};

export const Button = styled.TouchableOpacity`
  min-height: 120px;
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm + 2}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 6px;
  shadow-opacity: 1;
  shadow-radius: 16px;
  elevation: ${({ theme }) => theme.elevation.card};
`;

export const ImageShell = styled.View<{ $category: ProductCategory }>`
  width: 80px;
  height: 80px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${({ $category }) => categoryShellStyles[$category]}
`;

export const ProductImage = styled.Image.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: 100%;
`;

export const ImageFallbackText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.headingSm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingSm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingLg.fontWeight};
`;

export const Content = styled.View`
  flex: 1;
  min-height: 80px;
  align-self: stretch;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs + 2}px;
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const TextColumn = styled.View`
  flex: 1;
  flex-shrink: 1;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const FavoriteSlot = styled.View`
  width: 36px;
  min-height: 36px;
  align-items: flex-end;
  justify-content: flex-start;
`;

export const ProductName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingSm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingSm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const CategoryTag = styled.View<{ $category: ProductCategory }>`
  align-self: flex-start;
  padding-horizontal: ${({ theme }) => theme.spacing.sm - 2}px;
  padding-vertical: 3px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  ${({ $category }) => categoryTagStyles[$category]}
`;

export const CategoryText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Description = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  padding-right: ${({ theme }) => theme.spacing.xs}px;
`;
