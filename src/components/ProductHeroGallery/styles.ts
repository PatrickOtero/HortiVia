import styled from 'styled-components/native';

export const Container = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const GalleryShell = styled.View`
  position: relative;
  min-height: 348px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl + 8}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const Scroll = styled.ScrollView``;

export const Slide = styled.View<{ $width: number }>`
  width: ${({ $width }) => ($width > 0 ? `${$width}px` : '100%')};
  height: 348px;
`;

export const SlideImage = styled.Image.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const CounterPill = styled.View`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg}px;
  right: ${({ theme }) => theme.spacing.lg}px;
  z-index: 3;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const CounterText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const CaptionCard = styled.View`
  position: absolute;
  right: ${({ theme }) => theme.spacing.lg}px;
  bottom: ${({ theme }) => theme.spacing.lg}px;
  left: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const CaptionLabel = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  text-transform: uppercase;
`;

export const CaptionText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const PaginationRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const PaginationDot = styled.View<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? 22 : 8)}px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.borderStrong};
`;

export const PlaceholderShell = styled.View`
  min-height: 320px;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl + 8}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const PlaceholderBadge = styled.View`
  width: 88px;
  height: 88px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const PlaceholderInitial = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: 30px;
  line-height: 36px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
`;

export const PlaceholderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingLg.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingLg.fontWeight};
  text-align: center;
`;

export const PlaceholderText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  text-align: center;
`;
