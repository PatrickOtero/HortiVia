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

export const Button = styled.TouchableOpacity`
  width: 220px;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
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
  width: 100%;
  height: 120px;
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
  font-size: ${({ theme }) => theme.typography.headingLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingLg.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingLg.fontWeight};
`;

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CategoryTag = styled.View<{ $category: ProductCategory }>`
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  ${({ $category }) => categoryShellStyles[$category]}
`;

export const CategoryText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ProductName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingSm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingSm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const ProductDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;
