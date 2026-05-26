import styled, { css } from 'styled-components/native';
import type { ProductCategory } from '../../features/products/types/product';

const categoryStyles = {
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
  width: 212px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const ImageShell = styled.View<{ $category: ProductCategory }>`
  width: 100%;
  height: 96px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${({ $category }) => categoryStyles[$category]}
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
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  min-height: 84px;
`;

export const CategoryTag = styled.View<{ $category: ProductCategory }>`
  align-self: flex-start;
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: 4px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  ${({ $category }) => categoryStyles[$category]}
`;

export const CategoryText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const Description = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;
