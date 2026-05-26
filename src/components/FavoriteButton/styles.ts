import styled from 'styled-components/native';

type FavoriteButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_HEIGHT = {
  sm: 40,
  md: 44,
  lg: 48,
} as const;

const BUTTON_WIDTH = {
  sm: 40,
  md: 112,
  lg: 124,
} as const;

export const Button = styled.TouchableOpacity<{
  $active: boolean;
  $size: FavoriteButtonSize;
  $withLabel: boolean;
}>`
  height: ${({ $size }) => BUTTON_HEIGHT[$size]}px;
  width: ${({ $size, $withLabel }) =>
    $withLabel ? BUTTON_WIDTH[$size] : BUTTON_HEIGHT[$size]}px;
  padding-horizontal: ${({ theme, $withLabel }) =>
    $withLabel ? theme.spacing.md : 0}px;
  padding-vertical: 0px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : theme.colors.surface};
`;

export const IconSlot = styled.View`
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
`;

export const Icon = styled.Text<{ $active: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
  font-size: 16px;
  line-height: 16px;
`;

export const Label = styled.Text<{ $active: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  flex-shrink: 1;
`;
