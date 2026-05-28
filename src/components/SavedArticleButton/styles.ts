import styled, { css } from 'styled-components/native';

type SavedButtonSize = 'sm' | 'md' | 'lg';

const HEIGHT_BY_SIZE = {
  sm: 40,
  md: 44,
  lg: 48,
} as const;

const WIDTH_BY_SIZE = {
  sm: 40,
  md: 110,
  lg: 122,
} as const;

const ICON_BY_SIZE = {
  sm: 14,
  md: 16,
  lg: 18,
} as const;

export const Button = styled.TouchableOpacity<{
  $active: boolean;
  $size: SavedButtonSize;
  $withLabel: boolean;
}>`
  height: ${({ $size }) => HEIGHT_BY_SIZE[$size]}px;
  width: ${({ $size, $withLabel }) =>
    $withLabel ? WIDTH_BY_SIZE[$size] : HEIGHT_BY_SIZE[$size]}px;
  padding-horizontal: ${({ theme, $withLabel }) =>
    $withLabel ? theme.spacing.md : 0}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : 'rgba(254, 255, 252, 0.96)'};
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 6px;
  shadow-opacity: 1;
  shadow-radius: 14px;
  elevation: ${({ theme }) => theme.elevation.card};
`;

export const IconSlot = styled.View<{ $size: SavedButtonSize }>`
  width: ${({ $size }) => ICON_BY_SIZE[$size]}px;
  height: ${({ $size }) => ICON_BY_SIZE[$size] + 3}px;
  align-items: center;
  justify-content: flex-start;
`;

export const BookmarkOutline = styled.View<{
  $active: boolean;
  $size: SavedButtonSize;
}>`
  width: ${({ $size }) => ICON_BY_SIZE[$size]}px;
  height: ${({ $size }) => ICON_BY_SIZE[$size] + 2}px;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  border-width: 1.6px;
  border-bottom-width: 0px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : 'transparent'};
`;

export const BookmarkNotch = styled.View<{
  $active: boolean;
  $size: SavedButtonSize;
}>`
  position: absolute;
  top: ${({ $size }) => ICON_BY_SIZE[$size] - 1}px;
  width: 0px;
  height: 0px;
  border-left-width: ${({ $size }) => Math.round(ICON_BY_SIZE[$size] / 2)}px;
  border-right-width: ${({ $size }) => Math.round(ICON_BY_SIZE[$size] / 2)}px;
  border-top-width: ${({ $size }) => Math.max(6, Math.round(ICON_BY_SIZE[$size] / 2))}px;
  border-left-color: transparent;
  border-right-color: transparent;
  border-top-color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
`;

export const BookmarkCut = styled.View<{
  $active: boolean;
  $size: SavedButtonSize;
}>`
  position: absolute;
  top: ${({ $size }) => ICON_BY_SIZE[$size] - 3}px;
  width: 0px;
  height: 0px;
  border-left-width: ${({ $size }) => Math.max(3, Math.round(ICON_BY_SIZE[$size] / 4))}px;
  border-right-width: ${({ $size }) => Math.max(3, Math.round(ICON_BY_SIZE[$size] / 4))}px;
  border-top-width: ${({ $size }) => Math.max(4, Math.round(ICON_BY_SIZE[$size] / 3))}px;
  border-left-color: transparent;
  border-right-color: transparent;
  border-top-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : 'rgba(254, 255, 252, 0.96)'};
`;

export const Label = styled.Text<{ $active: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  flex-shrink: 1;
`;

export const LoadingShell = styled.View<{ $withLabel: boolean }>`
  ${({ $withLabel }) =>
    $withLabel
      ? css`
          width: 100%;
          align-items: center;
          justify-content: center;
        `
      : css`
          align-items: center;
          justify-content: center;
        `}
`;
