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

export const Content = styled.View`
  gap: ${({ theme }) => theme.layout.sectionGap}px;
`;

export const HeroStage = styled.View`
  position: relative;
  margin-horizontal: ${({ theme }) => -theme.layout.screenPadding}px;
`;

export const FloatingBackButton = styled.View`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg}px;
  left: ${({ theme }) => theme.layout.screenPadding}px;
  z-index: 4;
`;

export const SummaryCard = styled.View`
  margin-top: -52px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 10px;
  shadow-opacity: 1;
  shadow-radius: 24px;
  elevation: ${({ theme }) => theme.elevation.floating};
`;

export const SummaryContent = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CategoryTag = styled.View<{ $category: ProductCategory }>`
  align-self: flex-start;
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
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

export const ProductName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 28px;
  line-height: 34px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
  letter-spacing: ${({ theme }) => theme.typography.display.letterSpacing}px;
`;

export const ProductSummary = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyLg.lineHeight}px;
`;

export const ProductDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const StatusContent = styled.View`
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;
