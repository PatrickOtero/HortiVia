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

export const ImageShell = styled.View<{
  $category: ProductCategory;
  $size: 'row' | 'tile';
}>`
  width: ${({ $size }) => ($size === 'row' ? '80px' : '100%')};
  height: ${({ $size }) => ($size === 'row' ? '80px' : '120px')};
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

export const ImageFallbackText = styled.Text<{ $size: 'row' | 'tile' }>`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme, $size }) =>
    ($size === 'row'
      ? theme.typography.headingSm.fontSize
      : theme.typography.headingLg.fontSize)}px;
  line-height: ${({ theme, $size }) =>
    ($size === 'row'
      ? theme.typography.headingSm.lineHeight
      : theme.typography.headingLg.lineHeight)}px;
  font-weight: ${({ theme }) => theme.typography.headingLg.fontWeight};
`;
